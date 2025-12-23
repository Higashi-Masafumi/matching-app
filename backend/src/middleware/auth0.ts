import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';

const issuer = process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}/` : undefined;
const audience = process.env.AUTH0_AUDIENCE;

const jwks = issuer ? createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`)) : undefined;

export type Auth0User = JWTPayload & { sub: string; scope?: string; permissions?: string[] };

const missingConfigMessage =
  'Auth0 configuration is missing. Please set AUTH0_DOMAIN and AUTH0_AUDIENCE environment variables.';

export const auth0Middleware = async (c: Context, next: Next) => {
  if (!issuer || !audience || !jwks) {
    console.error(missingConfigMessage);
    throw new HTTPException(500, { message: missingConfigMessage });
  }

  const authHeader = c.req.header('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Authorization header with Bearer token is required.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const verification = await jwtVerify(token, jwks, { issuer, audience });
    c.set('auth0User', verification.payload as Auth0User);
    await next();
  } catch (error) {
    console.error('Auth0 token verification failed:', error);
    throw new HTTPException(401, { message: 'Invalid or expired Auth0 token.' });
  }
};
