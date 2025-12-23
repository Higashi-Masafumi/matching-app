import { createRoute, z, type OpenAPIHono } from '@hono/zod-openapi';
import type { ListUniversitiesUseCase } from '../usecases/list-universities';
import type { GetCatalogConfigurationUseCase } from '../usecases/get-catalog-configuration';

type CatalogDeps = {
  listUniversitiesUseCase: ListUniversitiesUseCase;
  getCatalogConfigurationUseCase: GetCatalogConfigurationUseCase;
};

export const registerCatalogRoutes = (app: OpenAPIHono, deps: CatalogDeps) => {
  const UniversitySchema = z
    .object({
      id: z.string().min(1).openapi({ example: 'uni_1234' }),
      name: z.string().min(1).openapi({ example: 'Example University' }),
      city: z.string().min(1).openapi({ example: 'Tokyo' }),
      region: z.string().min(1).openapi({ example: '関東' }),
      country: z.string().min(1).openapi({ example: 'JP' }),
      tags: z.array(z.string().min(1)).openapi({ example: ['国立', '総合'] }),
      programs: z
        .array(z.string().min(1))
        .nonempty()
        .openapi({ example: ['Computer Science', 'Economics'] }),
      verificationLevel: z.enum(['basic', 'strict']).openapi({ example: 'strict' }),
      website: z
        .string()
        .url()
        .optional()
        .openapi({ example: 'https://www.exampleuniversity.jp' }),
    })
    .openapi('University');

  const IntentOptionSchema = z.object({
    id: z.string().min(1).openapi({ example: 'same' }),
    label: z.string().min(1).openapi({ example: '同じ大学でマッチ' }),
    description: z.string().min(1),
    radiusKm: z.number().nullable().optional(),
  });

  const WeightPresetSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    weights: z.object({
      major: z.number(),
      campus: z.number(),
      activity: z.number(),
    }),
    note: z.string().min(1),
    isActive: z.boolean(),
  });

  const VerificationFlagSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1),
    required: z.boolean(),
  });

  const CatalogQuerySchema = z.object({
    search: z.string().optional().openapi({ description: 'Free text search' }),
    program: z.string().optional().openapi({ description: 'Filter by program name' }),
    country: z.string().optional().openapi({ description: 'Filter by country code' }),
    limit: z
      .coerce.number()
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

  const CatalogConfigurationSchema = z.object({
    intents: z.array(IntentOptionSchema),
    weightPresets: z.array(WeightPresetSchema),
    verificationFlags: z.array(VerificationFlagSchema),
  });

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

  const catalogConfigurationRoute = createRoute({
    method: 'get',
    path: '/catalog/configuration',
    description: 'UI metadata for catalog filters and weighting presets.',
    summary: 'Catalog configuration',
    tags: ['Catalog'],
    responses: {
      200: {
        description: 'Available filters and presets',
        content: {
          'application/json': { schema: CatalogConfigurationSchema },
        },
      },
    },
  });

  app.openapi(listUniversitiesRoute, async (c) => {
    const params = c.req.valid('query');
    const universities = await deps.listUniversitiesUseCase.execute(params);

    return c.json({
      total: universities.length,
      results: universities,
    });
  });

  app.openapi(catalogConfigurationRoute, async (c) => {
    const configuration = await deps.getCatalogConfigurationUseCase.execute();
    return c.json(configuration);
  });
};
