import cron from 'node-cron';
import axios from 'axios';
import { db } from '../../config/firebase';
import dotenv from 'dotenv';
dotenv.config();

interface FMPQuote {
  symbol: string;
  price: number;
  volume: number;
  timestamp: number;
}

interface SectorMap {
  [symbol: string]: string;
}

const SECTOR_MAP: SectorMap = {
  AAPL: 'technology',
  GOOGL: 'technology',
  MSFT: 'technology',
};

const FMP_API_KEY = process.env.FMP_API_KEY || '';
const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT'];

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

        await db.collection('stocks').doc(symbol).set(
          {
            symbol,
            price,
            volume,
            lastUpdated: new Date(timestamp * 1000).toISOString(),
          },
          { merge: true }
        );

        totalPrice += price;
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

      for (const stock of stocks) {
        const sector = SECTOR_MAP[stock.symbol];
        if (!sector) continue;

        const summary = `${stock.symbol} in ${sector} trading at $${stock.price}`;
        await db.collection('sectors').doc(sector).set({ [stock.price]: summary }, { merge: true });
      }

      try {
        const snapshot = await db.collection('portfolios').get();
        const frequency: Record<string, number> = {};
        let total = 0;

        snapshot.forEach((doc) => {
          const { symbol, quantity } = doc.data();
          if (symbol) {
            frequency[symbol] = (frequency[symbol] || 0) + quantity;
            total++;
          }
        });

        const mostTracked = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        await db.collection('userTrends').doc('portfolio_trends').set({
          mostTracked,
          totalHoldings: total,
          timestamp: new Date().toISOString(),
        });
      } catch {
      }
    } catch {
    }
  });
};
