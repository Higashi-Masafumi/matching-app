import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('*', logger());

app.get('/', (c) => c.json({ message: 'Matching App API is running' }));
app.get('/healthz', (c) => c.json({ status: 'ok' }));

const port = Number(process.env.PORT) || 3000;

console.log(`Starting Hono server on port ${port}`);
serve({ fetch: app.fetch, port });
