/**
 * Entry point for the application server.
 * 
 * This file starts the Express server and listens on the specified port.
 * The application instance is imported from the './app' module.
 */

import app from "./app";
import { scheduleStockDataFetch } from "./utils/cronJobs/fetchData";

/**
 * Defines the port number for the server to listen on.
 * Falls back to 3000 if the PORT environment variable is not set.
 */
const PORT: number = parseInt(process.env.PORT || "3000", 10);

/**
 * Starts the Express server and initializes scheduled background tasks.
 * Logs the server URL to the console when running.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Start the recurring stock data fetch cron job
  scheduleStockDataFetch(); 
});