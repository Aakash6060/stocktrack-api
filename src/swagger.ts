/**
 * @fileoverview Sets up Swagger documentation for the StockTrack API using swagger-jsdoc and swagger-ui-express.
 * This configuration parses JSDoc comments in route files to generate interactive API documentation.
 */

import swaggerJsdoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger configuration options.
 * 
 * - `openapi`: Specifies the OpenAPI version (3.0.0).
 * - `info`: Provides metadata such as title, version, and description of the API.
 * - `apis`: An array of file patterns that Swagger JSDoc should scan for annotations.
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
  apis: ['./src/api/v1/routes/*.ts'], // Path to route files with Swagger JSDoc comments
};

/**
 * Generates the OpenAPI specification from JSDoc annotations using swagger-jsdoc.
 */
const specs: ReturnType<typeof swaggerJsdoc> = swaggerJsdoc(options);

/**
 * Exports the generated Swagger specs and the middleware to serve Swagger UI.
 */
export { specs, swaggerUi };