import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import type { UpdateProfileUseCase } from "../usecases/update-profile";
import type { Profile } from "../domain/entities/profile";

type ProfileDeps = {
  updateProfileUseCase: UpdateProfileUseCase;
};

const AUTHENTICATED_USER_ID = "user_456";

const toProfileResponse = (profile: Profile) => ({
  id: profile.id,
  name: profile.name,
  universityId: profile.universityId,
  majors: profile.majors,
  interests: profile.interests,
  languages: profile.languages,
  bio: profile.bio,
  preferredLocations: profile.preferredLocations,
});

export const registerProfileRoutes = (app: OpenAPIHono, deps: ProfileDeps) => {
  const ProfileSchema = z
    .object({
      id: z.string().min(1).openapi({ example: "user_456" }),
      name: z.string().min(1).openapi({ example: "Mika Sato" }),
      universityId: z.string().min(1).openapi({ example: "uni_1234" }),
      majors: z
        .array(z.string().min(1))
        .openapi({ example: ["Economics", "Data Science"] }),
      interests: z
        .array(z.string().min(1))
        .openapi({ example: ["AI ethics", "Music"] }),
      languages: z.array(z.string().min(1)).openapi({ example: ["ja", "en"] }),
      bio: z
        .string()
        .optional()
        .openapi({ example: "Looking for research exchange opportunities." }),
      preferredLocations: z
        .array(z.string().min(1))
        .openapi({ example: ["Tokyo", "Osaka"] }),
    })
    .openapi("Profile");

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
      description: "Editable fields for the user profile",
    })
    .openapi("ProfileUpdateRequest");

  const updateProfileRoute = createRoute({
    method: "put",
    path: "/profile",
    summary: "Update the current user profile",
    description: "Persists profile fields to improve match quality.",
    tags: ["Profile"],
    security: [{ EmailOtpToken: [] }],
    request: {
      body: {
        content: {
          "application/json": { schema: ProfileUpdateRequestSchema },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "Updated profile data",
        content: {
          "application/json": {
            schema: ProfileSchema,
          },
        },
      },
      401: { description: "Email OTP token is missing or invalid" },
    },
  });

  app.openapi(updateProfileRoute, async (c) => {
    const profileUpdates = c.req.valid("json");

    const updated = await deps.updateProfileUseCase.execute({
      ...profileUpdates,
      id: AUTHENTICATED_USER_ID,
    });

    return c.json(toProfileResponse(updated));
  });
};
