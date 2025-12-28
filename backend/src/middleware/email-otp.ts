import type { Context, MiddlewareHandler, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";

const jwtIssuer = "matching-app-email-otp";
const jwtSecret = process.env.EMAIL_AUTH_JWT_SECRET;

export type EmailOtpUser = {
  email: string;
  domain: string;
};

const getJwtSecret = () => {
  if (!jwtSecret) {
    const message =
      "Email OTP auth secret is missing. Please set EMAIL_AUTH_JWT_SECRET.";
    console.error(message);
    throw new HTTPException(500, { message });
  }

  return jwtSecret;
};

const createJwtMiddleware = () =>
  jwt({
    secret: getJwtSecret(),
    alg: "HS256",
    verification: {
      iss: jwtIssuer,
    },
  });

export const emailOtpMiddleware: MiddlewareHandler = async (
  c: Context,
  next: Next,
) => {
  try {
    const jwtMiddleware = createJwtMiddleware();
    await jwtMiddleware(c, async () => {
      const payload = c.get("jwtPayload") as Record<string, unknown> | null;
      const email = typeof payload?.email === "string" ? payload.email : null;
      const domain = typeof payload?.domain === "string" ? payload.domain : null;

      if (!email || !domain) {
        throw new HTTPException(401, {
          message: "Email OTP token payload is invalid.",
        });
      }

      c.set("emailUser", { email, domain } satisfies EmailOtpUser);
      await next();
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    console.error("Email OTP token verification failed:", error);
    throw new HTTPException(401, {
      message: "Invalid or expired email OTP token.",
    });
  }
};
