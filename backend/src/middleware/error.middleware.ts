import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
}

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req,
  res,
  _next,
): void => {
  const isProd = process.env.NODE_ENV === 'production';

  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues,
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${String(err.value)}`,
    });
    return;
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    (err as MongoError).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: 'Duplicate entry — record already exists',
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }

  const stdErr = err instanceof Error ? err : new Error(String(err));
  const errAsUnknown: unknown = stdErr;
  const statusCode =
    typeof (errAsUnknown as Record<string, unknown>).statusCode === 'number'
      ? (errAsUnknown as Record<string, unknown>).statusCode as number
      : 500;

  res.status(statusCode).json({
    success: false,
    message: stdErr.message || 'Internal server error',
    ...(!isProd && statusCode === 500 ? { stack: stdErr.stack } : {}),
  });
};
