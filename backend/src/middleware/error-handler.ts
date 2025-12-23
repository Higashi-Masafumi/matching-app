import { DomainError } from '../domain/errors/domain-error';
import type { Context, Next } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    if (error instanceof DomainError) {
      c.status(error.status as StatusCode);
      return c.json({ error: error.name, message: error.message, details: error.details });
    }

    console.error('Unhandled error', error);
    c.status(500 as StatusCode);
    return c.json({ error: 'InternalServerError', message: '予期しないエラーが発生しました。' });
  }
};
