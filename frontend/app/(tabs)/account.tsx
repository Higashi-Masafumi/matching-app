import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/providers/auth-context';

export default function AccountScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isLoading, login, logout, userInfo, accessToken } = useAuth();

  const maskedToken = useMemo(() => {
    if (!accessToken) return '未取得';
    return `${accessToken.slice(0, 8)}...${accessToken.slice(-6)}`;
  }, [accessToken]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.card, { borderColor: theme.icon }]}>
        <ThemedText type="title" style={styles.cardTitle}>
          Auth0 サインイン
        </ThemedText>
        <ThemedText style={styles.cardBody}>
          Auth0 の Universal Login を利用して、バックエンドへのリクエストに Bearer トークンを自動付与します。
          ミドルウェアでヘッダーに設定されるため、個別の API 呼び出しでのトークン管理は不要です。
        </ThemedText>

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
          onPress={isAuthenticated ? logout : login}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.tint,
              opacity: pressed || isLoading ? 0.85 : 1,
            },
          ]}>
          <ThemedText style={styles.primaryButtonText}>
            {isLoading ? '処理中...' : isAuthenticated ? 'ログアウトする' : 'Auth0でログイン'}
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
            : 'ログインすると Auth0 から返却されたクレームを表示します。'}
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
});
