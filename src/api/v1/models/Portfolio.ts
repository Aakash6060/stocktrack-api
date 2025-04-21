/**
 * Represents a stock held within a user's investment portfolio.
 *
 * @interface PortfolioStock
 */
export interface PortfolioStock {
  /**
   * The stock ticker symbol.
   * For example: "AAPL", "GOOGL", "TSLA"
   * 
   * @example "AAPL"
   */ 
    symbol: string;
  
  /**
   * The number of shares owned for this stock.
   * 
   * @example 10
   */
    quantity: number;

  /**
   * The average price paid per share.
   * 
   * @example 145.75
   */
    averageBuyPrice: number;
  }
  