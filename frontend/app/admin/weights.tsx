import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  AdminControl,
  AdminState,
  getAdminControls,
  setWeightPreset,
  toggleVerificationPolicy,
  weightPresetCatalog,
} from '@/services/mock-admin-service';

export default function AdminWeightsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [state, dispatch] = useReducer(
    (
      current: { data: AdminState | null; isLoading: boolean },
      action:
        | { type: 'load/start' }
        | { type: 'load/success'; payload: AdminState }
        | { type: 'load/error' }
        | { type: 'update'; payload: AdminState | null }
    ) => {
      switch (action.type) {
        case 'load/start':
          return { ...current, isLoading: true };
        case 'load/success':
          return { data: action.payload, isLoading: false };
        case 'load/error':
          return { data: null, isLoading: false };
        case 'update':
          return { ...current, data: action.payload };
        default:
          return current;
      }
    },
    { data: null, isLoading: true }
  );

  const adminState = state.data;
  const isLoading = state.isLoading;

  const load = useCallback(async () => {
    dispatch({ type: 'load/start' });
    try {
      const next = await getAdminControls();
      dispatch({ type: 'load/success', payload: next });
    } catch {
      dispatch({ type: 'load/error' });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activePreset = useMemo(
    () => weightPresetCatalog.find((preset) => preset.key === adminState?.weightPreset),
    [adminState?.weightPreset]
  );

  const handlePresetChange = (presetKey: AdminState['weightPreset']) => {
    if (!adminState) return;
    const previous = adminState;
    setPendingAction('preset');
    dispatch({ type: 'update', payload: { ...adminState, weightPreset: presetKey } });

    setWeightPreset(presetKey)
      .then((next) => {
        dispatch({ type: 'update', payload: next });
      })
      .catch(() => {
        dispatch({ type: 'update', payload: previous });
      })
      .finally(() => {
        setPendingAction(null);
      });
  };

  const handleVerificationToggle = () => {
    if (!adminState) return;
    const previous = adminState;
    const optimistic: AdminState = {
      ...adminState,
      verificationPolicy: adminState.verificationPolicy === 'strict' ? 'relaxed' : 'strict',
    };

    setPendingAction('verification');
    dispatch({ type: 'update', payload: optimistic });

    toggleVerificationPolicy()
      .then((next) => {
        dispatch({ type: 'update', payload: next });
      })
      .catch(() => {
        dispatch({ type: 'update', payload: previous });
      })
      .finally(() => {
        setPendingAction(null);
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.icon }]}> 
        <ThemedText type="title" style={styles.heroTitle}>
          重み付けプリセットと本人確認ポリシー
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          季節イベントや大学別の傾向に合わせてアルゴリズムの重みを切り替え、本人確認の厳格さもここで制御します。
        </ThemedText>
        <View style={styles.badgeRow}>
          <Badge label={`現在: ${activePreset?.title ?? '読込中'}`} themeColor={theme.tint} />
          <Badge
            label={
              adminState?.verificationPolicy === 'strict'
                ? '本人確認: 大学メール + 学籍証明'
                : '本人確認: 大学メール中心'
            }
            themeColor={theme.icon}
            subtle
          />
        </View>
      </ThemedView>

      {isLoading ? (
        <ThemedView style={[styles.card, { borderColor: theme.icon, alignItems: 'center' }]}> 
          <ActivityIndicator />
          <ThemedText style={styles.cardBody}>管理モックを読み込んでいます...</ThemedText>
        </ThemedView>
      ) : null}

      {!adminState && !isLoading ? (
        <ThemedView style={[styles.card, { borderColor: theme.icon, gap: 10 }]}> 
          <ThemedText type="subtitle" style={styles.cardTitle}>
            モックを取得できませんでした
          </ThemedText>
          <ThemedText style={styles.cardBody}>ネットワークエラーを模した失敗です。再取得してください。</ThemedText>
          <Pressable
            onPress={load}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.85 : 1 },
            ]}>
            <ThemedText style={styles.primaryButtonText}>再取得する</ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}

      {adminState ? (
        <ThemedView style={[styles.card, { borderColor: theme.icon, gap: 12 }]}> 
          <ThemedText type="subtitle" style={styles.cardTitle}>
            プリセットを選択
          </ThemedText>
          <View style={styles.actionRow}>
            {weightPresetCatalog.map((preset) => (
              <Pressable
                key={preset.key}
                onPress={() => handlePresetChange(preset.key)}
                disabled={pendingAction === 'preset'}
                style={({ pressed }) => [
                  styles.presetCard,
                  {
                    borderColor: preset.key === adminState.weightPreset ? theme.tint : theme.icon,
                    backgroundColor: preset.key === adminState.weightPreset ? `${theme.tint}12` : 'transparent',
                    opacity: pressed || pendingAction === 'preset' ? 0.85 : 1,
                  },
                ]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {preset.title}
                </ThemedText>
                <ThemedText style={styles.cardBody}>{preset.description}</ThemedText>
                <View style={styles.weightChips}>
                  <WeightChip label="専攻" value={preset.weights.major} themeColor={theme.tint} />
                  <WeightChip label="エリア" value={preset.weights.campus} themeColor={theme.tint} />
                  <WeightChip label="活動" value={preset.weights.activity} themeColor={theme.tint} />
                </View>
              </Pressable>
            ))}
          </View>

          <ThemedText type="subtitle" style={styles.cardTitle}>
            本人確認ポリシー
          </ThemedText>
          <Pressable
            onPress={handleVerificationToggle}
            disabled={pendingAction === 'verification'}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: theme.tint,
                opacity: pressed || pendingAction === 'verification' ? 0.85 : 1,
              },
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: theme.tint }]}> 
              {adminState.verificationPolicy === 'strict' ? '柔軟モードにする' : '厳格モードにする'}
            </ThemedText>
          </Pressable>

          <ThemedText style={styles.helperText}>
            ・厳格モード: 大学メール + 学籍証明を必須にし、未審査ユーザーを非表示。
            {'\n'}・柔軟モード: 大学メール認証をベースにしつつ、新規ユーザーの表示を拡大。
          </ThemedText>
        </ThemedView>
      ) : null}

      {adminState ? (
        <Section title="運営ステータス" themeIcon={theme.icon}>
          {adminState.controls.map((control) => (
            <AdminStatusCard key={control.key} control={control} themeIcon={theme.icon} />
          ))}
        </Section>
      ) : null}
    </ScrollView>
  );
}

function Badge({ label, themeColor, subtle }: { label: string; themeColor: string; subtle?: boolean }) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: subtle ? 'transparent' : `${themeColor}12`,
          borderColor: `${themeColor}50`,
        },
      ]}>
      <ThemedText style={styles.badgeText}>{label}</ThemedText>
    </View>
  );
}

function WeightChip({ label, value, themeColor }: { label: string; value: number; themeColor: string }) {
  return (
    <View style={[styles.weightChip, { backgroundColor: `${themeColor}12`, borderColor: `${themeColor}50` }]}> 
      <ThemedText style={styles.weightChipLabel}>{label}</ThemedText>
      <ThemedText style={styles.weightChipValue}>{Math.round(value * 100)}%</ThemedText>
    </View>
  );
}

function AdminStatusCard({ control, themeIcon }: { control: AdminControl; themeIcon: string }) {
  return (
    <ThemedView style={[styles.statusCard, { borderColor: themeIcon }]}> 
      <View style={styles.statusRow}>
        <ThemedText type="subtitle" style={styles.statusTitle}>
          {control.title}
        </ThemedText>
        <View style={[styles.statusPill, { borderColor: `${themeIcon}50` }]}> 
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: control.enabled ? '#2ecc71' : '#f0ad4e',
            }}
          />
          <ThemedText style={styles.statusLabel}>{control.enabled ? 'ON' : 'OFF'}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.statusDescription}>{control.description}</ThemedText>
      <ThemedText style={styles.statusMeta}>{control.meta}</ThemedText>
    </ThemedView>
  );
}

function Section({ children, title, themeIcon }: { children: React.ReactNode; title: string; themeIcon: string }) {
  return (
    <ThemedView style={[styles.card, { borderColor: themeIcon, gap: 12 }]}> 
      <ThemedText type="subtitle" style={styles.cardTitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 10,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
  },
  cardBody: {
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  weightChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  weightChipLabel: {
    fontSize: 12,
  },
  weightChipValue: {
    fontFamily: Fonts.mono,
  },
  primaryButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontWeight: '700',
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontWeight: '700',
  },
  helperText: {
    lineHeight: 18,
  },
  statusCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 12,
  },
  statusDescription: {
    lineHeight: 18,
  },
  statusMeta: {
    fontSize: 12,
    opacity: 0.8,
  },
});
