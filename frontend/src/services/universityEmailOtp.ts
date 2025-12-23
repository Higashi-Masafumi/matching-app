import { apiClient } from './api-client';

export type OtpRequestPayload = { email: string };
export type OtpRequestResponse = { deliveryHint: string; expiresInSeconds: number; domain: string };

export type OtpVerificationPayload = { email: string; code: string };
export type OtpVerificationResponse = {
  token: string;
  verifiedEmail: string;
  verifiedDomain: string;
  verifiedAt: string;
};

const getErrorMessage = (error: { message?: string; data?: { message?: string } }) =>
  error.data?.message ?? error.message ?? '通信に失敗しました。時間をおいて再度お試しください。';

export async function requestUniversityEmailOtp({ email }: OtpRequestPayload) {
  const { data, error } = await apiClient.POST('/auth/email/request', { body: { email } });

  if (error || !data) {
    throw new Error(getErrorMessage(error ?? {}));
  }

  return data as OtpRequestResponse;
}

export async function verifyUniversityEmailOtp({ email, code }: OtpVerificationPayload) {
  const { data, error } = await apiClient.POST('/auth/email/verify', { body: { email, code } });

  if (error || !data) {
    throw new Error(getErrorMessage(error ?? {}));
  }

  return data as OtpVerificationResponse;
}
