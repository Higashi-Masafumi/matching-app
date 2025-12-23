import { createRoute, z, type OpenAPIHono } from '@hono/zod-openapi';
import type { GetRecommendedCandidatesUseCase } from '../usecases/get-recommended-candidates';

type MatchDeps = {
  getRecommendedCandidatesUseCase: GetRecommendedCandidatesUseCase;
};

const AUTHENTICATED_USER_ID = 'user_456';

export const registerMatchRoutes = (app: OpenAPIHono, deps: MatchDeps) => {
  const CandidateSchema = z
    .object({
      id: z.string().min(1).openapi({ example: 'candidate_987' }),
      name: z.string().min(1).openapi({ example: 'Hiro Tanaka' }),
      universityId: z.string().min(1).openapi({ example: 'uni_1234' }),
      matchScore: z
        .number()
        .min(0)
        .max(1)
        .openapi({ description: 'Compatibility between 0 and 1', example: 0.82 }),
      sharedInterests: z
        .array(z.string().min(1))
        .openapi({ example: ['Machine Learning', 'Language Exchange'] }),
      introduction: z
        .string()
        .optional()
        .openapi({ example: 'Interested in study abroad research projects.' }),
    })
    .openapi('MatchCandidate');

  const MatchQuerySchema = z.object({
    limit: z
      .coerce.number()
      .int()
      .min(1)
      .max(25)
      .default(10)
      .optional()
      .openapi({ description: 'Number of candidates to retrieve', example: 10 }),
    offset: z
      .coerce.number()
      .int()
      .min(0)
      .optional()
      .openapi({ description: 'Pagination offset', example: 0 }),
  });

  const MatchCandidatesResponseSchema = z
    .object({
      results: z.array(CandidateSchema),
      nextOffset: z.number().int().nullable().openapi({ example: 10 }),
    })
    .openapi('MatchCandidatesResponse');

  const recommendedCandidatesRoute = createRoute({
    method: 'get',
    path: '/matches/candidates',
    summary: 'Fetch recommended match candidates for the authenticated user',
    description: 'Returns a ranked list of candidates using the current profile context.',
    tags: ['Matches'],
    request: {
      query: MatchQuerySchema,
    },
    security: [{ UniversityEmailOtp: [] }],
    responses: {
      200: {
        description: 'Candidate matches returned successfully',
        content: {
          'application/json': {
            schema: MatchCandidatesResponseSchema,
          },
        },
      },
      401: {
        description: 'Missing or invalid email OTP authentication',
      },
    },
  });

  app.openapi(recommendedCandidatesRoute, async (c) => {
    const { limit = 10, offset = 0 } = c.req.valid('query');
    const result = await deps.getRecommendedCandidatesUseCase.execute({
      userId: AUTHENTICATED_USER_ID,
      limit,
      offset,
    });

    return c.json(result);
  });
};
