import { serve } from "@hono/node-server";
import { createApp } from "./app";

const app = createApp();

const port = Number(process.env.PORT) || 3001;

console.log(`Starting Hono server on port ${port}`);
serve({ fetch: app.fetch, port });
