import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { logger } from "hono/logger";
import type { Context } from "hono";
import { registerCatalogRoutes } from "./routes/catalog";
import { registerAuthRoutes } from "./routes/auth";
import { registerMatchRoutes } from "./routes/matches";
import { registerProfileRoutes } from "./routes/profile";
import { createContainer } from "./container";
import { errorHandler } from "./middleware/error-handler";
import { emailOtpMiddleware } from "./middleware/email-otp";

type OpenAPIConfig = Parameters<
  InstanceType<typeof OpenAPIHono>["getOpenAPIDocument"]
>[0];
type OpenAPIConfigWithComponents = OpenAPIConfig & {
  components?: {
    securitySchemes?: Record<string, unknown>;
  };
};

export const openApiConfig: OpenAPIConfigWithComponents = {
  openapi: "3.0.3",
  info: {
    title: "Matching App API",
    version: "0.1.0",
    description: "API specification for the university matching platform.",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      EmailOtpToken: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          "Provide the JWT issued after verifying a university email OTP.",
      },
    },
  },
  security: [{ EmailOtpToken: [] }],
};

export const createApp = () => {
  const app = new OpenAPIHono();
  const container = createContainer();

  app.use("*", logger());
  app.use("*", errorHandler);

  app.get("/", (c: Context) =>
    c.json({ message: "Matching App API is running" }),
  );
  app.get("/healthz", (c: Context) => c.json({ status: "ok" }));

  app.doc("/openapi.json", openApiConfig);

  app.use("/matches/*", emailOtpMiddleware);
  app.use("/profile/*", emailOtpMiddleware);

  registerAuthRoutes(app);
  registerCatalogRoutes(app, {
    listUniversitiesUseCase: container.listUniversitiesUseCase,
    getCatalogConfigurationUseCase: container.getCatalogConfigurationUseCase,
  });
  registerMatchRoutes(app, {
    getRecommendedCandidatesUseCase: container.getRecommendedCandidatesUseCase,
  });
  registerProfileRoutes(app, {
    updateProfileUseCase: container.updateProfileUseCase,
  });

  const routeNotFound = createRoute({
    method: "get",
    path: "/openapi",
    summary: "OpenAPI document redirect",
    description: "Redirects to the OpenAPI JSON document.",
    responses: {
      302: {
        description: "Redirect to the OpenAPI document",
      },
    },
  });

  app.openapi(routeNotFound, (c) => c.redirect("/openapi.json"));

  return app;
};
