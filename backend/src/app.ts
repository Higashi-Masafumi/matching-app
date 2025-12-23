import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { logger } from 'hono/logger';
import type { Context } from 'hono';
import { registerCatalogRoutes } from './routes/catalog';
import { registerMatchRoutes } from './routes/matches';
import { registerProfileRoutes } from './routes/profile';

type OpenAPIConfig = Parameters<InstanceType<typeof OpenAPIHono>['getOpenAPIDocument']>[0];
type OpenAPIConfigWithComponents = OpenAPIConfig & {
  components?: {
    securitySchemes?: Record<string, unknown>;
  };
};

export const openApiConfig: OpenAPIConfigWithComponents = {
  openapi: '3.0.3',
  info: {
    title: 'Matching App API',
    version: '0.1.0',
    description: 'API specification for the university matching platform.',
  },
  servers: [{ url: 'https://api.example.com' }],
  components: {
    securitySchemes: {
      UniversityEmailOtp: {
        type: 'apiKey',
        in: 'header',
        name: 'X-University-OTP',
        description:
          'One-time passcode delivered to a verified university email address. Required to fetch personalized matches.',
      },
      StudentIdUpload: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Issued after uploading and verifying a valid student ID card. Required for profile updates and sensitive actions.',
      },
    },
  },
  security: [{ UniversityEmailOtp: [] }, { StudentIdUpload: [] }],
};

export const createApp = () => {
  const app = new OpenAPIHono();

  app.use('*', logger());

  app.get('/', (c: Context) => c.json({ message: 'Matching App API is running' }));
  app.get('/healthz', (c: Context) => c.json({ status: 'ok' }));

  app.doc('/openapi.json', openApiConfig);

  registerCatalogRoutes(app);
  registerMatchRoutes(app);
  registerProfileRoutes(app);

  const routeNotFound = createRoute({
    method: 'get',
    path: '/openapi',
    summary: 'OpenAPI document redirect',
    description: 'Redirects to the OpenAPI JSON document.',
    responses: {
      302: {
        description: 'Redirect to the OpenAPI document',
      },
    },
  });

  app.openapi(routeNotFound, (c) => c.redirect('/openapi.json'));

  return app;
};
