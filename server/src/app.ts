import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  })
);

// Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Root Information
app.get('/', (req: Request, res: Response) => {
  res.json({
    platform: 'CPGRAMS 2.0 API Engine',
    mission: "Reimagining India's Public Grievance Digital Infrastructure",
    status: 'ONLINE',
    documentation: '/api/v1/health',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Catch-All Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `The requested endpoint ${req.method} ${req.path} does not exist on CPGRAMS 2.0 API.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
