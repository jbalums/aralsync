import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z } from 'zod';

export function validateBody(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
      return;
    }
    // Express 5: req.query is a read-only getter — validation is done, don't reassign
    next();
  };
}

export function validateParams(schema: z.ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.issues,
      });
      return;
    }
    // Express 5: req.params is a read-only getter — validation is done, don't reassign
    next();
  };
}
