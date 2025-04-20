/**
 * Entry point for the application server.
 * 
 * This file starts the Express server and listens on the specified port.
 * The application instance is imported from the './app' module.
 */

import app from "./app";
import { scheduleStockDataFetch } from "./utils/cronJobs/fetchData";

// Define the port the server will listen on, defaulting to 3000 if not specified in environment variables
const PORT: number = parseInt(process.env.PORT || "3000", 10);

/**
 * Starts the server and logs the running URL to the console.
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  scheduleStockDataFetch(); 
});