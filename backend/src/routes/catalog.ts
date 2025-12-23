import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registerCatalogRoutes = (registry: OpenAPIRegistry) => {
  const UniversitySchema = registry.register(
    'University',
    z
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
      .openapi({ description: 'A university entry in the catalog' })
  );

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

  const CatalogResponseSchema = registry.register(
    'UniversityCatalogResponse',
    z.object({
      total: z.number().int().nonnegative().openapi({ example: 128 }),
      results: z.array(UniversitySchema),
    })
  );

  registry.registerPath({
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
};
