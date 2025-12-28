import { createRoute, z, type OpenAPIHono } from "@hono/zod-openapi";
import { SignJWT } from "jose";

const jwtIssuer = "matching-app-email-otp";
const jwtSecret = process.env.EMAIL_AUTH_JWT_SECRET;

const domainAllowlist = [
  "u-tokyo.ac.jp",
  "kyoto-u.ac.jp",
  "waseda.jp",
  "keio.jp",
  "omu.ac.jp",
];

const otpStore = new Map<
  string,
  { code: string; expiresAt: number; attemptsLeft: number; lastSentAt: number }
>();

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const getJwtSecret = () => {
  if (!jwtSecret) {
    throw new Error("EMAIL_AUTH_JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(jwtSecret);
};

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  if (!localPart) return email;
  const visible = localPart.slice(0, 2);
  return `${visible}***@${domain}`;
};

const extractDomain = (email: string) =>
  email.split("@")[1]?.toLowerCase() ?? "";

export const registerAuthRoutes = (app: OpenAPIHono) => {
  const requestOtpRoute = createRoute({
    method: "post",
    path: "/auth/email/request",
    summary: "Request a university email OTP",
    description:
      "Validates that the email belongs to an allowlisted university domain and issues a one-time passcode.",
    tags: ["Auth"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                email: z
                  .string()
                  .email()
                  .openapi({ example: "student@u-tokyo.ac.jp" }),
              })
              .openapi("UniversityEmailRequest"),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "OTP issued to the provided email",
        content: {
          "application/json": {
            schema: z.object({
              deliveryHint: z
                .string()
                .openapi({ example: "st***@u-tokyo.ac.jp" }),
              expiresInSeconds: z
                .number()
                .int()
                .positive()
                .openapi({ example: 600 }),
              domain: z.string().openapi({ example: "u-tokyo.ac.jp" }),
            }),
          },
        },
      },
      400: {
        description: "Email domain is not eligible for OTP issuance",
      },
    },
  });

  app.openapi(requestOtpRoute, (c) => {
    const { email } = c.req.valid("json");
    const domain = extractDomain(email);

    if (!domainAllowlist.includes(domain)) {
      return c.json(
        { message: "この大学ドメインは現在サポート対象外です。" },
        400,
      );
    }

    const code = generateOtp();
    const expiresAt = Date.now() + OTP_EXPIRY_MS;

    otpStore.set(email, {
      code,
      expiresAt,
      attemptsLeft: 5,
      lastSentAt: Date.now(),
    });
    console.info(`[mock-email] Sending OTP ${code} to ${email}`);

    return c.json({
      deliveryHint: maskEmail(email),
      expiresInSeconds: OTP_EXPIRY_MS / 1000,
      domain,
    });
  });

  const verifyOtpRoute = createRoute({
    method: "post",
    path: "/auth/email/verify",
    summary: "Verify a university email OTP",
    description:
      "Verifies the one-time passcode and returns a signed JWT for API access.",
    tags: ["Auth"],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z
              .object({
                email: z
                  .string()
                  .email()
                  .openapi({ example: "student@u-tokyo.ac.jp" }),
                code: z.string().min(6).max(6).openapi({ example: "123456" }),
              })
              .openapi("UniversityEmailVerification"),
          },
        },
        required: true,
      },
    },
    responses: {
      200: {
        description: "OTP was valid and the user is verified",
        content: {
          "application/json": {
            schema: z.object({
              token: z.string().openapi({ example: "email_otp_jwt" }),
              verifiedEmail: z.string().email(),
              verifiedDomain: z.string(),
              verifiedAt: z.string().datetime(),
            }),
          },
        },
      },
      400: { description: "OTP is invalid or expired" },
      404: { description: "No OTP request found for the email" },
    },
  });

  app.openapi(verifyOtpRoute, async (c) => {
    const { email, code } = c.req.valid("json");
    const record = otpStore.get(email);

    if (!record) {
      return c.json(
        { message: "このメールアドレスへのOTPリクエストが見つかりません。" },
        404,
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return c.json(
        {
          message: "OTPの有効期限が切れています。再度リクエストしてください。",
        },
        400,
      );
    }

    if (record.code !== code) {
      record.attemptsLeft -= 1;

      if (record.attemptsLeft <= 0) {
        otpStore.delete(email);
        return c.json(
          { message: "試行回数を超えました。新しいコードを取得してください。" },
          400,
        );
      }

      otpStore.set(email, record);
      return c.json(
        { message: "OTPが一致しません。再確認してください。" },
        400,
      );
    }

    otpStore.delete(email);

    if (!jwtSecret) {
      return c.json(
        {
          message:
            "認証トークンの発行に失敗しました。管理者に連絡してください。",
        },
        500,
      );
    }

    const token = await new SignJWT({
      email,
      domain: extractDomain(email),
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setIssuer(jwtIssuer)
      .setExpirationTime("2h")
      .sign(getJwtSecret());

    return c.json({
      token,
      verifiedEmail: email,
      verifiedDomain: extractDomain(email),
      verifiedAt: new Date().toISOString(),
    });
  });
};
