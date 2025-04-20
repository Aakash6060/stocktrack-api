import cron from 'node-cron';
import axios from 'axios';
import { db } from '../../config/firebase';
import dotenv from 'dotenv';
import type { AnalysisResult } from 'sentiment';
dotenv.config();

import Sentiment from 'sentiment';
const sentiment: Sentiment = new Sentiment();

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

interface NewsArticle {
  datetime: number;
  headline: string;
  source: string;
  url: string;
}

interface PortfolioDoc {
  symbol: string;
  quantity: number;
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

const FMP_API_KEY: string = process.env.FMP_API_KEY || '';
const FINNHUB_API_KEY: string = process.env.FINNHUB_API_KEY || '';
const STOCK_SYMBOLS: string[] = Object.keys(NAME_MAP);

export const scheduleStockDataFetch = (): void => {
  cron.schedule('15 * * * * *', () => {
    void (async (): Promise<void> => {
      const symbolsQuery: string = STOCK_SYMBOLS.join(',');
      const url: string = `https://financialmodelingprep.com/api/v3/quote/${symbolsQuery}?apikey=${FMP_API_KEY}`;

      try {
        const { data: stocks } = await axios.get<FMPQuote[]>(url);

        let totalPrice: number = 0;

        for (const stock of stocks) {
          const { symbol, price, volume, timestamp } = stock;
          const now: Date = new Date(timestamp * 1000);

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

          await db
            .collection('stocks')
            .doc(symbol)
            .collection('history')
            .doc(now.toISOString())
            .set({
              date: now.toISOString(),
              price,
            });

          try {
            const newsUrl: string = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-04-01&to=2025-04-20&token=${FINNHUB_API_KEY}`;
            const { data: newsArticlesRaw } = await axios.get<NewsArticle[]>(newsUrl);
            const newsArticles: NewsArticle[] = newsArticlesRaw.slice(0, 5) || [];            

            for (const article of newsArticles) {
              if (!article.datetime || !article.headline) continue;

              const articleId: string = new Date(article.datetime * 1000).toISOString();

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

            if (newsArticles.length > 0) {
              const headline: string = newsArticles[0].headline;
              const sentimentResult: AnalysisResult = sentiment.analyze(headline);
              const score: number = sentimentResult.score;

              const sentimentLabel: string =
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
          } catch (error: unknown) {
            console.error(`Error fetching news or sentiment for ${symbol}:`, error);
          }

          totalPrice += price;

          const sector: string | undefined = SECTOR_MAP[symbol];
          if (sector) {
            const summary: string = `${symbol} in ${sector} trading at $${price}`;
            await db.collection('sectors').doc(sector).set(
              {
                [price]: summary,
              },
              { merge: true }
            );
          }
        }

        const gainers: FMPQuote[] = [...stocks].sort((a, b) => b.price - a.price).slice(0, 3);
        const losers: FMPQuote[] = [...stocks].sort((a, b) => a.price - b.price).slice(0, 3);

        await db.collection('topMovers').doc('gainers').set({ stocks: gainers });
        await db.collection('topMovers').doc('losers').set({ stocks: losers });

        const avgPrice: number = +((totalPrice / stocks.length).toFixed(2));
        await db.collection('marketPerformance').doc('summary').set({
          index: 'S&P 500',
          change: +((Math.random() * 5).toFixed(2)),
          summary: `Average stock price of tracked symbols: $${avgPrice}`,
        });

        try {
          const snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData> =
            await db.collection('portfolios').get();
          const frequency: Record<string, number> = {};
          let total: number = 0;

          snapshot.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
            const data: Partial<PortfolioDoc> = doc.data() as PortfolioDoc;
            const symbol: string = data.symbol || '';
            const quantity: number = data.quantity || 0;
            if (symbol && quantity) {
              frequency[symbol] = (frequency[symbol] || 0) + quantity;
              total++;
            }
          });

          const mostTracked: string =
            Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

          await db.collection('userTrends').doc('portfolio_trends').set({
            mostTracked,
            totalHoldings: total,
            timestamp: new Date().toISOString(),
          });
        } catch (error: unknown) {
          console.error('Error fetching portfolio trends:', error);
        }
      } catch (error: unknown) {
        console.error('Error fetching stock data:', error);
      }
    })();
  });
};
