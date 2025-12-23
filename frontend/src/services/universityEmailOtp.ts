export type OtpRequestPayload = { email: string };
export type OtpRequestResponse = { deliveryHint: string; expiresInSeconds: number; domain: string };

export type OtpVerificationPayload = { email: string; code: string };
export type OtpVerificationResponse = {
  token: string;
  verifiedEmail: string;
  verifiedDomain: string;
  verifiedAt: string;
};

const allowlistedDomains = ['u-tokyo.ac.jp', 'kyoto-u.ac.jp', 'waseda.jp', 'keio.jp', 'omu.ac.jp'];

const otpState = new Map<
  string,
  { code: string; expiresAt: number; attemptsLeft: number; issuedAt: number; domain: string }
>();

const OTP_EXPIRES_IN_SECONDS = 10 * 60;

const simulateNetwork = async <T,>(result: T, failureRate = 0.05) => {
  const delay = 180 + Math.random() * 320;
  await new Promise((resolve) => setTimeout(resolve, delay));

  if (Math.random() < failureRate) {
    throw new Error('ネットワークエラー（モック）');
  }

  return JSON.parse(JSON.stringify(result)) as T;
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  if (!localPart) return email;
  return `${localPart.slice(0, 2)}***@${domain}`;
};

const extractDomain = (email: string) => email.split('@')[1]?.toLowerCase() ?? '';

export async function requestUniversityEmailOtp({ email }: OtpRequestPayload) {
  const domain = extractDomain(email);

  if (!allowlistedDomains.includes(domain)) {
    throw new Error('この大学ドメインは対象外です。担当者にお問い合わせください。');
  }

  const code = generateOtp();
  const expiresAt = Date.now() + OTP_EXPIRES_IN_SECONDS * 1000;
  otpState.set(email, { code, expiresAt, attemptsLeft: 5, issuedAt: Date.now(), domain });

  return simulateNetwork<OtpRequestResponse>({
    deliveryHint: maskEmail(email),
    expiresInSeconds: OTP_EXPIRES_IN_SECONDS,
    domain,
  });
}

export async function verifyUniversityEmailOtp({ email, code }: OtpVerificationPayload) {
  const record = otpState.get(email);

  if (!record) {
    throw new Error('先に大学メールへワンタイムコードを送信してください。');
  }

  if (Date.now() > record.expiresAt) {
    otpState.delete(email);
    throw new Error('コードの有効期限が切れています。再度送信してください。');
  }

  if (record.code !== code) {
    record.attemptsLeft -= 1;

    if (record.attemptsLeft <= 0) {
      otpState.delete(email);
      throw new Error('試行回数を超えました。新しいコードを取得してください。');
    }

    otpState.set(email, record);
    throw new Error('コードが一致しません。再確認してください。');
  }

  otpState.delete(email);

  return simulateNetwork<OtpVerificationResponse>({
    token: 'otp_verified_token',
    verifiedEmail: email,
    verifiedDomain: extractDomain(email),
    verifiedAt: new Date().toISOString(),
  });
}
