import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  type?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle Malformed JSON payload syntax error
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
    res.status(400).json({
      success: false,
      error: 'INVALID_JSON_PAYLOAD',
      message: 'The request body could not be parsed as valid JSON. Please check JSON formatting and quotes.',
    });
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Request payload validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  console.error(`[${new Date().toISOString()}] Error ${statusCode} on ${req.method} ${req.path}:`, err.message || err);

  res.status(statusCode).json({
    success: false,
    error: code,
    message,
    // "Your Work Is Safe" header hint if error happens on complaint routes
    recoveryHint: req.path.includes('complaints')
      ? 'Your local client-side draft remains completely intact. Please retry submission.'
      : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
