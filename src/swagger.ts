import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StockTrack API',
      version: '1.0.0',
      description: 'This is a back-end API for managing stocks, portfolios, and market insights.',
    },
  },
  apis: ['./src/api/v1/routes/*.ts'], // Path to the API routes with Swagger annotations
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
