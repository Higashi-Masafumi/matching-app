import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-context';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isLoading, requestOtp, verifyOtp, logout, userInfo, accessToken } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [deliveryHint, setDeliveryHint] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const maskedToken = useMemo(() => {
    if (!accessToken) return '未取得';
    return `${accessToken.slice(0, 8)}...${accessToken.slice(-6)}`;
  }, [accessToken]);

  const handleRequestOtp = useCallback(async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const response = await requestOtp(email.trim());
      setDeliveryHint(response.deliveryHint);
      setStatusMessage(`認証コードを送信しました（${response.expiresInSeconds}秒有効）`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '認証コードの送信に失敗しました。');
    }
  }, [email, requestOtp]);

  const handleVerifyOtp = useCallback(async () => {
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await verifyOtp(email.trim(), code.trim());
      setStatusMessage('認証が完了しました。');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '認証に失敗しました。');
    }
  }, [code, email, verifyOtp]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.card, { borderColor: theme.icon }]}>
        <ThemedText type="title" style={styles.cardTitle}>
          大学メール認証
        </ThemedText>
        <ThemedText style={styles.cardBody}>
          大学メールアドレスにワンタイムコードを送付し、検証が完了すると API 用の Bearer トークンを取得します。
          トークンは API 呼び出し時に自動でヘッダーへ付与されます。
        </ThemedText>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>大学メールアドレス</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
            placeholder="student@u-tokyo.ac.jp"
            placeholderTextColor={theme.icon}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Pressable
            onPress={handleRequestOtp}
            disabled={isLoading || !email}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: theme.tint,
                opacity: pressed || isLoading || !email ? 0.5 : 1,
              },
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: theme.tint }]}>
              認証コードを送信
            </ThemedText>
          </Pressable>
          {deliveryHint ? <ThemedText style={styles.helperText}>送信先: {deliveryHint}</ThemedText> : null}
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>認証コード</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
            placeholder="123456"
            placeholderTextColor={theme.icon}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            maxLength={6}
          />
          <Pressable
            onPress={handleVerifyOtp}
            disabled={isLoading || !email || code.length !== 6}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.tint,
                opacity: pressed || isLoading || !email || code.length !== 6 ? 0.5 : 1,
              },
            ]}>
            <ThemedText style={styles.primaryButtonText}>
              {isLoading ? '処理中...' : '認証する'}
            </ThemedText>
          </Pressable>
        </View>

        {statusMessage ? <ThemedText style={styles.statusText}>{statusMessage}</ThemedText> : null}
        {errorMessage ? <ThemedText style={styles.errorText}>{errorMessage}</ThemedText> : null}

        <View style={styles.statusRow}>
          <ThemedText style={styles.statusLabel}>認証状態</ThemedText>
          <ThemedText style={{ color: isAuthenticated ? theme.tint : theme.icon }}>
            {isAuthenticated ? 'ログイン済み' : '未ログイン'}
          </ThemedText>
        </View>
        <View style={styles.statusRow}>
          <ThemedText style={styles.statusLabel}>アクセストークン</ThemedText>
          <ThemedText>{maskedToken}</ThemedText>
        </View>

        <Pressable
          onPress={logout}
          disabled={isLoading || !isAuthenticated}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.tint,
              opacity: pressed || isLoading || !isAuthenticated ? 0.5 : 1,
            },
          ]}>
          <ThemedText style={styles.primaryButtonText}>
            {isLoading ? '処理中...' : 'ログアウトする'}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={[styles.card, { borderColor: theme.icon }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          プロフィールクレーム
        </ThemedText>
        <ThemedText style={styles.cardBody}>
          {isAuthenticated && userInfo
            ? JSON.stringify(userInfo, null, 2)
            : 'ログインすると認証済みメール情報を表示します。'}
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
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
  },
  cardBody: {
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#8c8c8c',
  },
  statusText: {
    color: '#1e7f5c',
  },
  errorText: {
    color: '#c0392b',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    color: '#8c8c8c',
  },
  primaryButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
});
