import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { connectDB } from './config/database';
import { config } from './config/env';
import { morganConfig, logger } from './utils/logger';
import { swaggerServe, swaggerSetup } from './config/swagger';
import routes from './routes';

// Inicializar Express
const app: Application = express();

// Conectar a MongoDB
connectDB();

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de compresión
app.use(compression());

// Middleware de logging
app.use(morganConfig);

// Swagger Documentation
app.use('/api-docs', swaggerServe, swaggerSetup);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Montar rutas de la API
app.use('/api', routes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Ruta raíz con información de la API
 */
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Car Inventory API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      api: '/api',
    },
  });
});

// Middleware de error 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    name: 'Not Found',
    message: 'Route not found',
    customMessage: 'La ruta solicitada no existe',
  });
});

// Middleware de manejo de errores global
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    status: 500,
    name: 'Internal Server Error',
    message: err.message || 'Something went wrong',
    customMessage: 'Error interno del servidor',
  });
});

// Iniciar servidor solo si no estamos en testing
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    logger.success(`Server running on http://${config.HOST}:${PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
    logger.info(`API Documentation: http://${config.HOST}:${PORT}/api-docs`);
    logger.info(`Press CTRL+C to stop`);
  });
}

export default app;
