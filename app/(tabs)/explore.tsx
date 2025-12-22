import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const launchChecklist = [
  '大学メール/学生証での二段階認証フロー',
  '学部・専攻・卒業予定年を入力するプロフィール設計',
  'マッチ対象大学と距離フィルターを設定するUI',
  '通報・ブロックと不正検知ワードの管理画面',
  'アルゴリズム重みプリセット（専攻・距離・活動）',
  'イベントや時期に応じて優先度を切り替える運営ボタン',
];

const adminControls = [
  {
    title: '大学指定マッチ',
    description: '指定した大学の学生のみ相互推薦。学内コミュニティを閉じて安全に運用。',
  },
  {
    title: '距離・エリアフィルター',
    description: 'キャンパス間距離を計算し、通学圏内の大学だけを表示。',
  },
  {
    title: '本人確認ステータス固定',
    description: '未確認アカウントを探索対象から外し、学籍証明アップロードを促す。',
  },
  {
    title: 'スロットリング',
    description: '人気大学へのアクセス集中を抑え、各大学の露出を均等化。',
  },
  {
    title: 'イベント用枠制御',
    description: '大学祭やオフラインイベントの期間だけマッチング優先度を変更。',
  },
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

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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

      <Section title="ローンチ前チェックリスト">
        {launchChecklist.map((item) => (
          <ListRow key={item} text={item} themeColor={theme.icon} />
        ))}
      </Section>

      <Section title="運営が操作できるレバー">
        <ThemedText style={styles.subtitle}>マッチング結果を意図に合わせるための管理UI案です。</ThemedText>
        <View style={styles.cardGrid}>
          {adminControls.map((control) => (
            <ThemedView key={control.title} style={[styles.card, { borderColor: theme.icon }]}> 
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {control.title}
              </ThemedText>
              <ThemedText style={styles.cardBody}>{control.description}</ThemedText>
            </ThemedView>
          ))}
        </View>
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

