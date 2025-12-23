import { createRoute, z, type OpenAPIHono } from '@hono/zod-openapi';

export const registerProfileRoutes = (app: OpenAPIHono) => {
  const ProfileSchema = z
    .object({
      id: z.string().min(1).openapi({ example: 'user_456' }),
      name: z.string().min(1).openapi({ example: 'Mika Sato' }),
      universityId: z.string().min(1).openapi({ example: 'uni_1234' }),
      majors: z.array(z.string().min(1)).openapi({ example: ['Economics', 'Data Science'] }),
      interests: z.array(z.string().min(1)).openapi({ example: ['AI ethics', 'Music'] }),
      languages: z.array(z.string().min(1)).openapi({ example: ['ja', 'en'] }),
      bio: z.string().optional().openapi({ example: 'Looking for research exchange opportunities.' }),
      preferredLocations: z.array(z.string().min(1)).openapi({ example: ['Tokyo', 'Osaka'] }),
    })
    .openapi('Profile');

  const ProfileUpdateRequestSchema = z
    .object({
      name: z.string().min(1).optional(),
      majors: z.array(z.string().min(1)).optional(),
      interests: z.array(z.string().min(1)).optional(),
      languages: z.array(z.string().min(1)).optional(),
      bio: z.string().optional(),
      preferredLocations: z.array(z.string().min(1)).optional(),
    })
    .openapi({
      description: 'Editable fields for the user profile',
    })
    .openapi('ProfileUpdateRequest');

  const updateProfileRoute = createRoute({
    method: 'put',
    path: '/profile',
    summary: 'Update the current user profile',
    description: 'Persists profile fields to improve match quality.',
    tags: ['Profile'],
    security: [{ Auth0AccessToken: [] }],
    request: {
      body: {
        content: {
          'application/json': { schema: ProfileUpdateRequestSchema },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: 'Updated profile data',
        content: {
          'application/json': {
            schema: ProfileSchema,
          },
        },
      },
      401: { description: 'Auth0 token is missing or invalid' },
    },
  });

  app.openapi(updateProfileRoute, (c) => {
    const profileUpdates = c.req.valid('json');

    return c.json({
      id: 'user_456',
      universityId: 'uni_1234',
      name: profileUpdates.name ?? 'Mika Sato',
      majors: profileUpdates.majors ?? ['Economics', 'Data Science'],
      interests: profileUpdates.interests ?? ['AI ethics', 'Music'],
      languages: profileUpdates.languages ?? ['ja', 'en'],
      bio: profileUpdates.bio ?? 'Looking for research exchange opportunities.',
      preferredLocations: profileUpdates.preferredLocations ?? ['Tokyo', 'Osaka'],
    });
  });
};
