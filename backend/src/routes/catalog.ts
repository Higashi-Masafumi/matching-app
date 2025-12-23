import { createRoute, z, type OpenAPIHono } from '@hono/zod-openapi';

export const registerCatalogRoutes = (app: OpenAPIHono) => {
  const UniversitySchema = z
    .object({
      id: z.string().min(1).openapi({ example: 'uni_1234' }),
      name: z.string().min(1).openapi({ example: 'Example University' }),
      location: z.string().min(1).openapi({ example: 'Tokyo, JP' }),
      programs: z
        .array(z.string().min(1))
        .nonempty()
        .openapi({ example: ['Computer Science', 'Economics'] }),
      website: z
        .string()
        .url()
        .optional()
        .openapi({ example: 'https://www.exampleuniversity.jp' }),
    })
    .openapi('University');

  const CatalogQuerySchema = z.object({
    search: z.string().optional().openapi({ description: 'Free text search' }),
    program: z.string().optional().openapi({ description: 'Filter by program name' }),
    country: z.string().optional().openapi({ description: 'Filter by country code' }),
    limit: z
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20)
      .optional()
      .openapi({ description: 'Maximum results to return', example: 20 }),
  });

  const CatalogResponseSchema = z
    .object({
      total: z.number().int().nonnegative().openapi({ example: 128 }),
      results: z.array(UniversitySchema),
    })
    .openapi('UniversityCatalogResponse');

  const listUniversitiesRoute = createRoute({
    method: 'get',
    path: '/catalog/universities',
    description: 'Retrieve universities available for matching.',
    summary: 'List university catalog',
    tags: ['Catalog'],
    request: {
      query: CatalogQuerySchema,
    },
    responses: {
      200: {
        description: 'Catalog entries matching the filters',
        content: {
          'application/json': {
            schema: CatalogResponseSchema,
          },
        },
      },
    },
  });

  app.openapi(listUniversitiesRoute, (c) => {
    return c.json({
      total: 0,
      results: [],
    });
  });
};
