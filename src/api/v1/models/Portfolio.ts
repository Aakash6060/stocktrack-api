/**
 * Represents a stock held within a user's portfolio.
 */
export interface PortfolioStock {
  /**
   * The stock ticker symbol (e.g., AAPL, GOOGL).
   */ 
    symbol: string;
  
  /**
   * The number of shares the user owns for this stock.
   */
    quantity: number;

  /**
   * The average price the user paid per share when buying this stock.
   */
    averageBuyPrice: number;
  }
  