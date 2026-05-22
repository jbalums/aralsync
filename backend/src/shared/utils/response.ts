import { Response } from 'express';

export function success(
  res: Response,
  data: unknown,
  statusCode = 200,
  meta?: unknown,
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function error(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown[],
): Response {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) body.errors = errors;
  return res.status(statusCode).json(body);
}
