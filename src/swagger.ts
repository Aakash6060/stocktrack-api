/**
 * @fileoverview Sets up Swagger documentation for the StockTrack API using swagger-jsdoc and swagger-ui-express.
 * This configuration parses JSDoc comments in route files to generate interactive API documentation.
 */

import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger configuration options.
 * - `definition`: Defines the OpenAPI spec version and basic API metadata.
 * - `apis`: Specifies the path to the route files containing JSDoc comments used to generate the docs.
 */
const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockTrack API',
      version: '1.0.0',
      description: 'This is a back-end API for managing stocks, portfolios, and market insights.',
    },
  },
  apis: ['./src/api/v1/routes/*.ts'], // Adjust path as needed
};

// Generate Swagger specifications from the provided options
const specs: ReturnType<typeof swaggerJsdoc> = swaggerJsdoc(options);

// Export the Swagger specs and UI middleware to be used in the main server file
export { specs, swaggerUi };
