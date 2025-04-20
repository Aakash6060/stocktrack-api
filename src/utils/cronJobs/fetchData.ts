import cron from 'node-cron';
import axios from 'axios';
import { db } from '../../config/firebase';
import dotenv from 'dotenv';
dotenv.config();

import Sentiment from 'sentiment';
const sentiment = new Sentiment();

interface FMPQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

interface SectorMap {
  [symbol: string]: string;
}

interface NameMap {
  [symbol: string]: string;
}

const SECTOR_MAP: SectorMap = {
  AAPL: 'technology',
  GOOGL: 'technology',
  MSFT: 'technology',
};

const NAME_MAP: NameMap = {
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft Corporation',
};

const FMP_API_KEY = process.env.FMP_API_KEY || '';
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const STOCK_SYMBOLS = Object.keys(NAME_MAP);

export const scheduleStockDataFetch = () => {
  cron.schedule('15 * * * * *', async () => {
    const symbolsQuery = STOCK_SYMBOLS.join(',');
    const url = `https://financialmodelingprep.com/api/v3/quote/${symbolsQuery}?apikey=${FMP_API_KEY}`;

    try {
      const response = await axios.get<FMPQuote[]>(url);
      const stocks = response.data;

      let totalPrice = 0;

      for (const stock of stocks) {
        const { symbol, price, volume, timestamp } = stock;
        const now = new Date(timestamp * 1000);

        await db.collection('stocks').doc(symbol).set(
          {
            symbol,
            name: NAME_MAP[symbol] || symbol,
            price,
            volume,
            lastUpdated: now.toISOString(),
          },
          { merge: true }
        );

        // Add to history subcollection
        await db
          .collection('stocks')
          .doc(symbol)
          .collection('history')
          .doc(now.toISOString())
          .set({
            date: now.toISOString(),
            price,
          });

        // Add to news and sentiment from Finnhub
        try {
          const newsUrl = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-04-01&to=2025-04-20&token=${FINNHUB_API_KEY}`;
          const newsResponse = await axios.get(newsUrl);
          const newsArticles = (newsResponse.data as any[]).slice(0, 5) || [];

          for (const article of newsArticles) {
            if (!article.datetime || !article.headline) continue;

            const articleId = new Date(article.datetime * 1000).toISOString();

            await db
              .collection('stocks')
              .doc(symbol)
              .collection('news')
              .doc(articleId)
              .set({
                title: article.headline,
                source: article.source,
                url: article.url,
                date: articleId,
              });
          }

          // Analyze sentiment based on top headline
          if (newsArticles.length > 0) {
            const headline = newsArticles[0].headline;
            const sentimentResult = sentiment.analyze(headline);
            const score = sentimentResult.score;

            const sentimentLabel =
              score > 2 ? 'Positive' : score < -2 ? 'Negative' : 'Neutral';

            await db
              .collection('stocks')
              .doc(symbol)
              .collection('sentiment')
              .doc('latest')
              .set({
                symbol,
                sentimentScore: score,
                sentiment: sentimentLabel,
                summary: `Headline: "${headline}" | Score: ${score}`,
              });
          }
        } catch (error) {
          console.error(`Error fetching news or sentiment for ${symbol}:`, error);
        }

        totalPrice += price;

        // Add sector info
        const sector = SECTOR_MAP[symbol];
        if (sector) {
          const summary = `${symbol} in ${sector} trading at $${price}`;
          await db.collection('sectors').doc(sector).set(
            {
              [price]: summary,
            },
            { merge: true }
          );
        }
      }

      const gainers = [...stocks].sort((a, b) => b.price - a.price).slice(0, 3);
      const losers = [...stocks].sort((a, b) => a.price - b.price).slice(0, 3);

      await db.collection('topMovers').doc('gainers').set({ stocks: gainers });
      await db.collection('topMovers').doc('losers').set({ stocks: losers });

      const avgPrice = +(totalPrice / stocks.length).toFixed(2);
      await db.collection('marketPerformance').doc('summary').set({
        index: 'S&P 500',
        change: +(Math.random() * 5).toFixed(2),
        summary: `Average stock price of tracked symbols: $${avgPrice}`,
      });

      // Portfolio trend tracking
      try {
        const snapshot = await db.collection('portfolios').get();
        const frequency: Record<string, number> = {};
        let total = 0;

        snapshot.forEach((doc) => {
          const { symbol, quantity } = doc.data();
          if (symbol && quantity) {
            frequency[symbol] = (frequency[symbol] || 0) + quantity;
            total++;
          }
        });

        const mostTracked =
          Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        await db.collection('userTrends').doc('portfolio_trends').set({
          mostTracked,
          totalHoldings: total,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching portfolio trends:', error);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  });
};
