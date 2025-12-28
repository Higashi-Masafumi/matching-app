import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useApiClient } from "@/providers/ApiProvider";
import {
  requestUniversityEmailOtp,
  verifyUniversityEmailOtp,
} from "@/services/universityEmailOtp";

function showToast(message: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert("OTP Demo", message);
}

export default function EmailOtpScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const { fetchClient } = useApiClient();
  const [email, setEmail] = useState("student@u-tokyo.ac.jp");
  const [otp, setOtp] = useState("");
  const [deliveryHint, setDeliveryHint] = useState<string | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null
  );
  const [otpError, setOtpError] = useState<string | null>(null);

  const requestOtpMutation = useMutation({
    mutationKey: ["request-university-email-otp"],
    mutationFn: (payload: { email: string }) =>
      requestUniversityEmailOtp(payload, fetchClient),
    onSuccess: (response) => {
      setDeliveryHint(response.deliveryHint);
      setOtpExpiresIn(response.expiresInSeconds);
      setOtpError(null);
      setVerificationMessage(null);
      showToast("ワンタイムコードを送信しました（モック）");
    },
    onError: (error) => {
      if (error instanceof Error) {
        setOtpError(error.message);
        return;
      }
      setOtpError("コード送信に失敗しました。再度お試しください。");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ["verify-university-email-otp"],
    mutationFn: (payload: { email: string; code: string }) =>
      verifyUniversityEmailOtp(payload, fetchClient),
    onSuccess: (result) => {
      setVerificationMessage(
        `${result.verifiedEmail} が認証されました。トークン: ${result.token}`
      );
      setOtpError(null);
      showToast("大学メールを認証しました（モック）");
    },
    onError: (error) => {
      if (error instanceof Error) {
        setOtpError(error.message);
        return;
      }
      setOtpError("認証に失敗しました。コードを確認してください。");
    },
  });

  const handleRequestOtp = async () => {
    setOtpError(null);
    setVerificationMessage(null);
    requestOtpMutation.mutate({ email });
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("受信した6桁コードを入力してください。");
      return;
    }

    setOtpError(null);
    setVerificationMessage(null);
    verifyOtpMutation.mutate({ email, code: otp });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.icon }]}>
        <ThemedText type="title" style={styles.heroTitle}>
          大学メールOTPによる本人確認
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          指定した学内ドメインのメールに6桁コードを送付し、マジックリンクの代替として本人確認します。入力はモックで完結します。
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.card, { borderColor: theme.icon }]}>
        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>大学メール</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.icon, color: theme.text },
            ]}
            placeholder="student@u-tokyo.ac.jp"
            placeholderTextColor={`${theme.icon}99`}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Pressable
          onPress={handleRequestOtp}
          disabled={requestOtpMutation.isPending}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.tint,
              opacity: pressed || requestOtpMutation.isPending ? 0.85 : 1,
            },
          ]}
        >
          <ThemedText style={styles.primaryButtonText}>
            {requestOtpMutation.isPending ? "送信中..." : "6桁コードを送信する"}
          </ThemedText>
        </Pressable>

        <View style={styles.inputRow}>
          <ThemedText style={styles.inputLabel}>受信したコード</ThemedText>
          <TextInput
            style={[
              styles.input,
              { borderColor: theme.icon, color: theme.text },
            ]}
            placeholder="123456"
            placeholderTextColor={`${theme.icon}99`}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
        </View>

        <Pressable
          onPress={handleVerifyOtp}
          disabled={verifyOtpMutation.isPending}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: theme.tint,
              opacity: pressed || verifyOtpMutation.isPending ? 0.85 : 1,
            },
          ]}
        >
          <ThemedText
            style={[styles.secondaryButtonText, { color: theme.tint }]}
          >
            {verifyOtpMutation.isPending ? "認証中..." : "コードを検証する"}
          </ThemedText>
        </Pressable>

        {deliveryHint ? (
          <ThemedText style={styles.helperText}>
            {deliveryHint} に送信済み。有効期限: 約 {otpExpiresIn ?? 0} 秒。
          </ThemedText>
        ) : null}

        {verificationMessage ? (
          <ThemedText style={[styles.helperText, { color: theme.tint }]}>
            {verificationMessage}
          </ThemedText>
        ) : null}

        {otpError ? (
          <ThemedText style={[styles.helperText, { color: "#d9534f" }]}>
            {otpError}
          </ThemedText>
        ) : null}
      </ThemedView>

      <ThemedView style={[styles.card, { borderColor: theme.icon }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          運用メモ
        </ThemedText>
        <ThemedText style={styles.cardBody}>
          ・メールドメインのホワイトリストを設定し、学外ドメインを遮断します。
          {"\n"}・学籍証明アップロードと組み合わせて二段階認証を構成。
          {"\n"}・認証済みトークンの有効期限を短く保ち、再認証を促します。
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 14,
  },
  hero: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  heroTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 22,
  },
  heroSubtitle: {
    lineHeight: 20,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
  },
  cardBody: {
    lineHeight: 18,
  },
  inputRow: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontWeight: "700",
    color: "#fff",
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  helperText: {
    lineHeight: 18,
  },
});
