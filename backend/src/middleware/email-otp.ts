import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwtVerify } from "jose";

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

  return new TextEncoder().encode(jwtSecret);
};

export const emailOtpMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, {
      message: "Authorization header with Bearer token is required.",
    });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const secret = getJwtSecret();
    const verification = await jwtVerify(token, secret, { issuer: jwtIssuer });
    const payload = verification.payload as Record<string, unknown>;
    c.set("emailUser", {
      email: payload.email as string,
      domain: payload.domain as string,
    } satisfies EmailOtpUser);
    await next();
  } catch (error) {
    console.error("Email OTP token verification failed:", error);
    throw new HTTPException(401, {
      message: "Invalid or expired email OTP token.",
    });
  }
};
