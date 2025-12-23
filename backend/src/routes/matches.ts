import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registerMatchRoutes = (registry: OpenAPIRegistry) => {
  const CandidateSchema = registry.register(
    'MatchCandidate',
    z
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
      .openapi({ description: 'Candidate suggested for matching' })
  );

  const MatchQuerySchema = z.object({
    limit: z
      .number()
      .int()
      .min(1)
      .max(25)
      .default(10)
      .optional()
      .openapi({ description: 'Number of candidates to retrieve', example: 10 }),
    offset: z
      .number()
      .int()
      .min(0)
      .optional()
      .openapi({ description: 'Pagination offset', example: 0 }),
  });

  const MatchCandidatesResponseSchema = registry.register(
    'MatchCandidatesResponse',
    z.object({
      results: z.array(CandidateSchema),
      nextOffset: z.number().int().nullable().openapi({ example: 10 }),
    })
  );

  registry.registerPath({
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
};
