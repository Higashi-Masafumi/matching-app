import { OpenAPIRegistry, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registerProfileRoutes = (registry: OpenAPIRegistry) => {
  const ProfileSchema = registry.register(
    'Profile',
    z.object({
      id: z.string().min(1).openapi({ example: 'user_456' }),
      name: z.string().min(1).openapi({ example: 'Mika Sato' }),
      universityId: z.string().min(1).openapi({ example: 'uni_1234' }),
      majors: z.array(z.string().min(1)).openapi({ example: ['Economics', 'Data Science'] }),
      interests: z.array(z.string().min(1)).openapi({ example: ['AI ethics', 'Music'] }),
      languages: z.array(z.string().min(1)).openapi({ example: ['ja', 'en'] }),
      bio: z.string().optional().openapi({ example: 'Looking for research exchange opportunities.' }),
      preferredLocations: z.array(z.string().min(1)).openapi({ example: ['Tokyo', 'Osaka'] }),
    })
  );

  const ProfileUpdateRequestSchema = registry.register(
    'ProfileUpdateRequest',
    z
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
  );

  registry.registerPath({
    method: 'put',
    path: '/profile',
    summary: 'Update the current user profile',
    description: 'Persists profile fields to improve match quality.',
    tags: ['Profile'],
    security: [{ StudentIdUpload: [] }],
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
      401: {
        description: 'Student ID verification token is missing or invalid',
      },
    },
  });
};
