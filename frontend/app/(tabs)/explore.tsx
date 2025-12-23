import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  Platform,
  TextInput,
  View,
} from 'react-native';

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
import {
  requestUniversityEmailOtp,
  verifyUniversityEmailOtp,
} from '@/src/services/universityEmailOtp';

const launchChecklist = [
  '大学メール/学生証での二段階認証フロー',
  '学部・専攻・卒業予定年を入力するプロフィール設計',
  'マッチ対象大学と距離フィルターを設定するUI',
  '通報・ブロックと不正検知ワードの管理画面',
  'アルゴリズム重みプリセット（専攻・距離・活動）',
  'イベントや時期に応じて優先度を切り替える運営ボタン',
];

const roadmapItems = [
  {
    label: 'Phase 1',
    items: [
      '学生本人確認の実装（大学メール + 学籍証明アップロード）',
      'ターゲット大学選択UIと距離フィルター',
      '安全性のためのチャットモデレーション',
    ],
  },
  {
    label: 'Phase 2',
    items: [
      'アルゴリズム重みの管理画面とABテスト',
      'サークル・ゼミ単位でのグループマッチ',
      'マッチ後のイベント提案（カラオケ・ボランティアなど）',
    ],
  },
  {
    label: 'Phase 3',
    items: [
      '学内ID連携で自動ログイン',
      '不正検知モデルの継続学習パイプライン',
      '学外パートナー大学との連携API',
    ],
  },
];

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    return;
  }

  Alert.alert('Mock admin', message);
}

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const [adminState, setAdminState] = useState<AdminState | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [email, setEmail] = useState('student@u-tokyo.ac.jp');
  const [otp, setOtp] = useState('');
  const [deliveryHint, setDeliveryHint] = useState<string | null>(null);
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const theme = Colors[colorScheme ?? 'light'];

  const refreshAdminState = async () => {
    setIsLoadingAdmin(true);
    try {
      const data = await getAdminControls();
      setAdminState(data);
    } catch {
      showToast('管理モックの読み込みに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  useEffect(() => {
    refreshAdminState();
  }, []);

  const handleRequestOtp = async () => {
    setIsRequestingOtp(true);
    setOtpError(null);
    setVerificationMessage(null);

    try {
      const response = await requestUniversityEmailOtp({ email });
      setDeliveryHint(response.deliveryHint);
      setOtpExpiresIn(response.expiresInSeconds);
      showToast('ワンタイムコードを送信しました（モック）');
    } catch (error) {
      if (error instanceof Error) {
        setOtpError(error.message);
      } else {
        setOtpError('コード送信に失敗しました。再度お試しください。');
      }
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('受信した6桁コードを入力してください。');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    setVerificationMessage(null);

    try {
      const result = await verifyUniversityEmailOtp({ email, code: otp });
      setVerificationMessage(
        `${result.verifiedEmail} が認証されました。トークン: ${result.token}`
      );
      showToast('大学メールを認証しました（モック）');
    } catch (error) {
      if (error instanceof Error) {
        setOtpError(error.message);
      } else {
        setOtpError('認証に失敗しました。コードを確認してください。');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePresetChange = async (presetKey: AdminState['weightPreset']) => {
    if (!adminState) return;

    const previous = adminState;
    setPendingAction('preset');
    setAdminState({ ...adminState, weightPreset: presetKey });

    try {
      const nextState = await setWeightPreset(presetKey);
      setAdminState(nextState);
      showToast('重みプリセットを更新しました (mock)');
    } catch {
      setAdminState(previous);
      showToast('プリセット更新に失敗しました (mock)');
    } finally {
      setPendingAction(null);
    }
  };

  const handleVerificationToggle = async () => {
    if (!adminState) return;

    const previous = adminState;
    const optimistic: AdminState = {
      ...adminState,
      verificationPolicy: adminState.verificationPolicy === 'strict' ? 'relaxed' : 'strict',
    };

    setPendingAction('verification');
    setAdminState(optimistic);

    try {
      const nextState = await toggleVerificationPolicy();
      setAdminState(nextState);
      showToast('本人確認ポリシーを更新しました (mock)');
    } catch {
      setAdminState(previous);
      showToast('本人確認ポリシーの更新に失敗しました (mock)');
    } finally {
      setPendingAction(null);
    }
  };

  const activePreset = useMemo(
    () => weightPresetCatalog.find((preset) => preset.key === adminState?.weightPreset),
    [adminState?.weightPreset]
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.section, { borderColor: theme.icon }]}>
        <ThemedText type="title" style={styles.title}>
          プロダクトの狙い
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          「大学生だけ」「大学ごとにマッチ先を指定できる」ことに特化。認証とアルゴリズム制御を両立させた実装イメージです。
        </ThemedText>
        <View style={styles.chipRow}>
          <Chip label="大学メール認証" themeColor={theme.tint} />
          <Chip label="指定大学マッチ" themeColor={theme.tint} />
          <Chip label="運営向けダッシュボード" themeColor={theme.tint} />
        </View>
      </ThemedView>

      <Section title="大学メールOTPデモ">
        <ThemedText style={styles.subtitle}>
          学内ドメインのメールアドレスにワンタイムコードを送付し、マジックリンク/OTPで本人確認するモックです。
        </ThemedText>

        <ThemedView style={[styles.verificationCard, { borderColor: theme.icon }]}>
          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>大学メール</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
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
            disabled={isRequestingOtp}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.tint,
                opacity: pressed || isRequestingOtp ? 0.8 : 1,
              },
            ]}>
            <ThemedText style={styles.primaryButtonText}>
              {isRequestingOtp ? '送信中...' : '6桁コードを送信する'}
            </ThemedText>
          </Pressable>

          <View style={styles.inputRow}>
            <ThemedText style={styles.inputLabel}>受信したコード</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: theme.icon, color: theme.text }]}
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
            disabled={isVerifyingOtp}
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                borderColor: theme.tint,
                opacity: pressed || isVerifyingOtp ? 0.8 : 1,
              },
            ]}>
            <ThemedText style={[styles.secondaryButtonText, { color: theme.tint }]}>
              {isVerifyingOtp ? '認証中...' : 'コードを検証する'}
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
            <ThemedText style={[styles.helperText, { color: '#d9534f' }]}>{otpError}</ThemedText>
          ) : null}
        </ThemedView>
      </Section>

      <Section title="ローンチ前チェックリスト">
        {launchChecklist.map((item) => (
          <ListRow key={item} text={item} themeColor={theme.icon} />
        ))}
      </Section>

      <Section title="運営が操作できるレバー">
        <ThemedText style={styles.subtitle}>マッチング結果を意図に合わせるための管理UI案です。</ThemedText>
        <AdminMockPanel
          adminState={adminState}
          isLoading={isLoadingAdmin}
          pendingAction={pendingAction}
          onPresetChange={handlePresetChange}
          onToggleVerification={handleVerificationToggle}
          onRefetch={refreshAdminState}
          activePreset={activePreset?.title}
          themeTint={theme.tint}
          themeIcon={theme.icon}
        />
      </Section>

      <Section title="運用フロー (例)">
        <ThemedView style={[styles.flowBox, { borderColor: theme.icon }]}> 
          <FlowStep index={1} title="本人確認" detail="大学メール + 学籍証明をアップロード。目視審査までは探索結果に表示しない。" />
          <FlowStep index={2} title="大学指定" detail="学生はマッチしたい大学を複数選択。運営は大学別の露出割合を設定。" />
          <FlowStep index={3} title="アルゴリズム" detail="専攻・距離・活動タグに重みを与え、季節イベントに合わせてプリセットを切り替え。" />
          <FlowStep index={4} title="安全運用" detail="チャットの不審ワード検知と通報フローをダッシュボードで一元管理。" />
        </ThemedView>
      </Section>

      <Section title="ロードマップ">
        <View style={styles.roadmap}>
          {roadmapItems.map((phase) => (
            <ThemedView key={phase.label} style={[styles.phase, { borderColor: theme.icon }]}> 
              <ThemedText type="subtitle" style={styles.phaseTitle}>
                {phase.label}
              </ThemedText>
              {phase.items.map((item) => (
                <ListRow key={item} text={item} themeColor={theme.tint} subtle />
              ))}
            </ThemedView>
          ))}
        </View>
      </Section>

      <Section title="実装時のヒント">
        <ThemedView style={[styles.tipBox, { borderColor: theme.icon }]}> 
          <ThemedText style={styles.tipTitle}>アルゴリズム制御</ThemedText>
          <ThemedText style={styles.tipBody}>
            ・専攻/距離/活動タグのスコアをそれぞれ0-1で正規化し、プリセットで重みを変更。
            {'\n'}・運営向けにABテスト用のバージョン番号を付与し、結果をイベントログで比較。
          </ThemedText>
          <ThemedText style={styles.tipTitle}>認証フロー</ThemedText>
          <ThemedText style={styles.tipBody}>
            ・大学ドメインメールでワンタイムコード送信。{'\n'}・学生証アップロードは自動OCR後にモデレーターが確認。{'\n'}・在学中データを定期的に再認証して健全性を維持。
          </ThemedText>
        </ThemedView>
      </Section>

      <Section title="デモCTA">
        <ThemedView style={[styles.ctaBox, { borderColor: theme.icon }]}> 
          <ThemedText style={styles.ctaTitle}>この設計でプロトタイプを作成できます</ThemedText>
          <ThemedText style={styles.ctaBody}>
            Expo + React Nativeで、学生認証・マッチング・運営ダッシュボードを段階的に実装する青写真です。
          </ThemedText>
          <Pressable style={({ pressed }) => [styles.ctaButton, { opacity: pressed ? 0.8 : 1, backgroundColor: theme.tint }]}>
            <ThemedText style={styles.ctaButtonText}>プロトタイプの相談をする</ThemedText>
          </Pressable>
        </ThemedView>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="title" style={styles.title}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

type AdminMockPanelProps = {
  adminState: AdminState | null;
  isLoading: boolean;
  pendingAction: string | null;
  onPresetChange: (presetKey: AdminState['weightPreset']) => void;
  onToggleVerification: () => void;
  onRefetch: () => void;
  activePreset?: string;
  themeTint: string;
  themeIcon: string;
};

function AdminMockPanel({
  adminState,
  isLoading,
  pendingAction,
  onPresetChange,
  onToggleVerification,
  onRefetch,
  activePreset,
  themeTint,
  themeIcon,
}: AdminMockPanelProps) {
  if (isLoading) {
    return (
      <ThemedView style={[styles.card, { borderColor: themeIcon, alignItems: 'center' }]}>
        <ActivityIndicator />
        <ThemedText style={styles.cardBody}>管理モックを読み込んでいます...</ThemedText>
      </ThemedView>
    );
  }

  if (!adminState) {
    return (
      <ThemedView style={[styles.card, { borderColor: themeIcon, gap: 10 }]}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          モック取得に失敗しました
        </ThemedText>
        <ThemedText style={styles.cardBody}>
          ネットワークエラーを模した失敗です。再度読み込みをお試しください。
        </ThemedText>
        <Pressable
          onPress={onRefetch}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: themeTint, opacity: pressed ? 0.8 : 1 },
          ]}>
          <ThemedText style={styles.actionButtonText}>状態を再取得</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <View style={styles.cardGrid}>
      <AdminActionCard
        title="アルゴリズム重みプリセット"
        description={activePreset ? `現在: ${activePreset}` : 'プリセットを選択'}
        actions={weightPresetCatalog.map((preset) => ({
          key: preset.key,
          label: preset.title,
          active: adminState.weightPreset === preset.key,
          onPress: () => onPresetChange(preset.key),
        }))}
        pending={pendingAction === 'preset'}
        themeTint={themeTint}
        themeIcon={themeIcon}
      />
      <AdminActionCard
        title="本人確認ポリシー"
        description={
          adminState.verificationPolicy === 'strict'
            ? '大学メール + 学籍証明を必須'
            : '大学メールを基準に柔軟参加'
        }
        actions={[
          {
            key: 'verification',
            label: adminState.verificationPolicy === 'strict' ? '柔軟モードにする' : '厳格モードにする',
            onPress: onToggleVerification,
          },
        ]}
        pending={pendingAction === 'verification'}
        themeTint={themeTint}
        themeIcon={themeIcon}
      />

      {adminState.controls.map((control) => (
        <AdminStatusCard key={control.key} control={control} themeIcon={themeIcon} />
      ))}
    </View>
  );
}

type AdminActionCardProps = {
  title: string;
  description: string;
  actions: { key: string; label: string; onPress: () => void; active?: boolean }[];
  pending?: boolean;
  themeTint: string;
  themeIcon: string;
};

function AdminActionCard({ title, description, actions, pending, themeTint, themeIcon }: AdminActionCardProps) {
  return (
    <ThemedView style={[styles.card, { borderColor: themeIcon, gap: 10 }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        {title}
      </ThemedText>
      <ThemedText style={styles.cardBody}>{description}</ThemedText>
      <View style={styles.actionRow}>
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            disabled={pending}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: action.active ? themeTint : `${themeIcon}22`,
                opacity: pressed || pending ? 0.7 : 1,
              },
            ]}>
            <ThemedText
              style={[
                styles.actionButtonText,
                { color: action.active ? '#fff' : themeIcon },
              ]}>
              {pending ? '更新中...' : action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

function AdminStatusCard({ control, themeIcon }: { control: AdminControl; themeIcon: string }) {
  return (
    <ThemedView style={[styles.card, { borderColor: themeIcon, gap: 8, flexBasis: '48%' }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        {control.title}
      </ThemedText>
      <ThemedText style={styles.cardBody}>{control.description}</ThemedText>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: control.active ? `${themeIcon}18` : `${themeIcon}12` },
          ]}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: control.active ? themeIcon : `${themeIcon}55` },
            ]}
          />
          <ThemedText style={styles.statusText}>{control.active ? '有効' : '停止中'}</ThemedText>
        </View>
        <ThemedText style={styles.statusMeta}>更新: {control.lastUpdated}</ThemedText>
      </View>
    </ThemedView>
  );
}

function Chip({ label, themeColor }: { label: string; themeColor: string }) {
  return (
    <View style={[styles.chip, { borderColor: `${themeColor}70`, backgroundColor: `${themeColor}15` }]}> 
      <ThemedText style={styles.chipText}>{label}</ThemedText>
    </View>
  );
}

function ListRow({ text, themeColor, subtle }: { text: string; themeColor: string; subtle?: boolean }) {
  return (
    <View style={styles.listRow}>
      <View style={[styles.bullet, { backgroundColor: subtle ? `${themeColor}55` : themeColor }]} />
      <ThemedText style={styles.listText}>{text}</ThemedText>
    </View>
  );
}

function FlowStep({ index, title, detail }: { index: number; title: string; detail: string }) {
  return (
    <View style={styles.flowRow}>
      <View style={styles.flowIndex}>
        <ThemedText style={styles.flowIndexText}>{index}</ThemedText>
      </View>
      <View style={styles.flowBody}>
        <ThemedText type="subtitle" style={styles.flowTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.flowDetail}>{detail}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 22,
  },
  subtitle: {
    lineHeight: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  verificationCard: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  inputRow: {
    gap: 6,
  },
  inputLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: '700',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flexBasis: '48%',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  cardBody: {
    lineHeight: 18,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
  },
  statusMeta: {
    fontSize: 12,
    opacity: 0.8,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listText: {
    flex: 1,
    lineHeight: 18,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  flowBox: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  flowRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flowIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  flowIndexText: {
    fontFamily: Fonts.mono,
  },
  flowBody: {
    flex: 1,
    gap: 4,
  },
  flowTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  flowDetail: {
    lineHeight: 18,
  },
  roadmap: {
    gap: 12,
  },
  phase: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  phaseTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  tipBox: {
    gap: 10,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  tipTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  tipBody: {
    lineHeight: 18,
  },
  ctaBox: {
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderRadius: 14,
  },
  ctaTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
  },
  ctaBody: {
    lineHeight: 18,
  },
  ctaButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
