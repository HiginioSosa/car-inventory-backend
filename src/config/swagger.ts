import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from './env';

/**
 * Configuración de Swagger/OpenAPI
 */
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Car Inventory API',
      version: '1.0.0',
      description: 'API REST para gestión de inventario de autos',
      contact: {
        name: 'API Support',
        email: 'support@carinventory.com',
      },
    },
    servers: [
      {
        url: `http://${config.HOST}:${config.PORT}`,
        description: `${config.NODE_ENV} server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec);
