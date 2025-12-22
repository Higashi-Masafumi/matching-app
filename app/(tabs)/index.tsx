import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const campusCatalog = [
  {
    id: 'utokyo',
    name: '東京大学',
    city: '東京',
    tags: ['国立', '関東'],
    programs: ['情報理工', '工学部', '経済学部'],
  },
  {
    id: 'kyodai',
    name: '京都大学',
    city: '京都',
    tags: ['国立', '関西'],
    programs: ['総合人間', '工学部', '農学部'],
  },
  {
    id: 'waseda',
    name: '早稲田大学',
    city: '東京',
    tags: ['私立', '関東'],
    programs: ['基幹理工', '政治経済', '商学部'],
  },
  {
    id: 'keio',
    name: '慶應義塾大学',
    city: '東京',
    tags: ['私立', '関東'],
    programs: ['理工学部', '総合政策', '環境情報'],
  },
  {
    id: 'osaka',
    name: '大阪公立大学',
    city: '大阪',
    tags: ['公立', '関西'],
    programs: ['経済学部', '医学部', '都市科学'],
  },
];

const intentOptions = [
  { key: 'same', label: '同じ大学でマッチ', description: '学内コミュニティを固めたい' },
  { key: 'nearby', label: '近隣大学と繋がる', description: '同じエリアでイベントをしたい' },
  { key: 'open', label: '全国どこでも', description: '進学・交換留学の相談をしたい' },
];

const weightPresets = [
  {
    key: 'major',
    title: '専攻マッチ重視',
    weights: { major: 0.5, campus: 0.3, activity: 0.2 },
    note: '研究室・専門領域の近さを優先',
  },
  {
    key: 'campus',
    title: 'キャンパス圏重視',
    weights: { major: 0.25, campus: 0.55, activity: 0.2 },
    note: '移動距離の短さと生活圏の相性を重視',
  },
  {
    key: 'activity',
    title: 'サークル/活動重視',
    weights: { major: 0.2, campus: 0.25, activity: 0.55 },
    note: '課外活動・イベント参加歴でマッチ',
  },
];

const matchIdeas = [
  {
    id: 'm1',
    title: '同じ専門でゼミ相談',
    snippet: '情報系専攻同士。研究テーマ・インターン情報を交換。',
    matchRate: 92,
  },
  {
    id: 'm2',
    title: '合同サークルイベント',
    snippet: '関東エリアの大学横断でボランティア企画を共催。',
    matchRate: 87,
  },
  {
    id: 'm3',
    title: '留学経験シェア',
    snippet: '交換留学経験者と出発前の学生をペアリング。',
    matchRate: 79,
  },
];

const verificationOptions = [
  '学籍番号 or ポータルで本人確認',
  '大学メールドメインで認証',
  'サークル・学部の在籍証明をアップロード',
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [selectedTargets, setSelectedTargets] = useState<string[]>(['utokyo', 'keio']);
  const [intent, setIntent] = useState(intentOptions[1].key);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);
  const [enableSmartRotation, setEnableSmartRotation] = useState(true);
  const [presetKey, setPresetKey] = useState(weightPresets[0].key);

  const activePreset = useMemo(
    () => weightPresets.find((preset) => preset.key === presetKey) ?? weightPresets[0],
    [presetKey]
  );

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.icon }]}> 
        <View style={styles.heroHeader}> 
          <ThemedText type="title" style={styles.heroTitle}>
            学生認証ベースの安心マッチング
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            大学生だけが、大学生同士で繋がる。マッチしたい大学を指定し、運営がアルゴリズムの重みを柔軟に調整できます。
          </ThemedText>
        </View>
        <View style={styles.heroBadges}>
          <Badge label="大学メール必須" themeColor={theme.tint} />
          <Badge label="不正検知AI" themeColor={theme.tint} />
          <Badge label="距離・専攻で最適化" themeColor={theme.tint} />
        </View>
      </ThemedView>

      <Section title="ターゲット大学を設定">
        <ThemedText style={styles.sectionSubtitle}>
          学生は希望する大学を複数選択。運営はマッチング優先度を大学別に設定できます。
        </ThemedText>
        <View style={styles.cardGrid}>
          {campusCatalog.map((campus) => (
            <Pressable
              key={campus.id}
              onPress={() => toggleTarget(campus.id)}
              style={({ pressed }) => [
                styles.campusCard,
                {
                  borderColor: selectedTargets.includes(campus.id) ? theme.tint : theme.icon,
                  backgroundColor: selectedTargets.includes(campus.id)
                    ? `${theme.tint}15`
                    : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {campus.name}
              </ThemedText>
              <ThemedText style={styles.cardMeta}>{campus.city}</ThemedText>
              <View style={styles.tagRow}>
                {campus.tags.map((tag) => (
                  <Badge key={tag} label={tag} themeColor={theme.icon} subtle />
                ))}
              </View>
              <ThemedText style={styles.cardPrograms}>主要プログラム: {campus.programs.join(', ')}</ThemedText>
              <SelectionMarker selected={selectedTargets.includes(campus.id)} />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="マッチング意図">
        <ThemedText style={styles.sectionSubtitle}>
          マッチする大学や距離感を指定。意図に応じてアルゴリズムの重み付けを変更します。
        </ThemedText>
        <View style={styles.intentRow}>
          {intentOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setIntent(option.key)}
              style={({ pressed }) => [
                styles.intentCard,
                {
                  borderColor: intent === option.key ? theme.tint : theme.icon,
                  backgroundColor: intent === option.key ? `${theme.tint}12` : 'transparent',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <ThemedText type="subtitle" style={styles.intentTitle}>
                {option.label}
              </ThemedText>
              <ThemedText style={styles.intentDescription}>{option.description}</ThemedText>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <Switch value={isVerifiedOnly} onValueChange={setIsVerifiedOnly} />
          <ThemedText style={styles.switchLabel}>本人確認済みユーザーのみ許可</ThemedText>
        </View>
        <View style={styles.switchRow}>
          <Switch value={enableSmartRotation} onValueChange={setEnableSmartRotation} />
          <ThemedText style={styles.switchLabel}>マッチ候補のスマートローテーション</ThemedText>
        </View>
      </Section>

      <Section title="運営用アルゴリズムコントロール">
        <ThemedText style={styles.sectionSubtitle}>
          重み付けプリセットを用意し、運営がイベントや季節に応じて切り替え可能。サマリーはリアルタイムで表示します。
        </ThemedText>
        <View style={styles.weightRow}>
          {weightPresets.map((preset) => (
            <Pressable
              key={preset.key}
              onPress={() => setPresetKey(preset.key)}
              style={({ pressed }) => [
                styles.weightCard,
                {
                  borderColor: presetKey === preset.key ? theme.tint : theme.icon,
                  backgroundColor: presetKey === preset.key ? `${theme.tint}10` : 'transparent',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {preset.title}
              </ThemedText>
              <ThemedText style={styles.cardMeta}>{preset.note}</ThemedText>
              <View style={styles.weightChips}>
                <WeightChip label="専攻" value={preset.weights.major} themeColor={theme.tint} />
                <WeightChip label="エリア" value={preset.weights.campus} themeColor={theme.tint} />
                <WeightChip label="活動" value={preset.weights.activity} themeColor={theme.tint} />
              </View>
            </Pressable>
          ))}
        </View>
        <ThemedView style={styles.summaryBox}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            現在のロジック概要
          </ThemedText>
          <ThemedText>
            ・ターゲット大学: {selectedTargets.length}校 / 意図: {intentOptions.find((opt) => opt.key === intent)?.label}
          </ThemedText>
          <ThemedText>
            ・本人確認: {isVerifiedOnly ? '必須 (大学メール + 学籍証明)' : '任意 (手動チェック)'}
          </ThemedText>
          <ThemedText>
            ・ローテーション: {enableSmartRotation ? '人気大学の集中を緩和して分散表示' : '新着順で表示'}
          </ThemedText>
          <ThemedText>
            ・重み付け: 専攻 {Math.round(activePreset.weights.major * 100)}% / エリア
            {` ${Math.round(activePreset.weights.campus * 100)}% / 活動 ${Math.round(activePreset.weights.activity * 100)}%`}
          </ThemedText>
        </ThemedView>
      </Section>

      <Section title="サンプルマッチングカード">
        <ThemedText style={styles.sectionSubtitle}>
          上記の設定で生成されるイメージ。学生は大学・専攻・活動タグを確認しながらマッチします。
        </ThemedText>
        <View style={styles.matchList}>
          {matchIdeas.map((idea) => (
            <ThemedView key={idea.id} style={styles.matchCard}>
              <View style={styles.matchHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {idea.title}
                </ThemedText>
                <Badge label={`適合度 ${idea.matchRate}%`} themeColor={theme.tint} />
              </View>
              <ThemedText style={styles.matchSnippet}>{idea.snippet}</ThemedText>
              <View style={styles.matchMetaRow}>
                <Badge label="本人確認済" themeColor={theme.icon} subtle />
                <Badge label={intentOptions.find((opt) => opt.key === intent)?.label ?? ''} themeColor={theme.icon} subtle />
                <Badge label={`対象 ${selectedTargets.length}校`} themeColor={theme.icon} subtle />
              </View>
            </ThemedView>
          ))}
        </View>
      </Section>

      <Section title="本人確認と安全対策">
        <ThemedText style={styles.sectionSubtitle}>
          学生限定を担保するための多段チェックと、運営のモデレーションポイントを整理しました。
        </ThemedText>
        <ThemedView style={styles.verificationBox}>
          {verificationOptions.map((item) => (
            <View key={item} style={styles.verificationItem}>
              <View style={[styles.bullet, { backgroundColor: theme.tint }]} />
              <ThemedText>{item}</ThemedText>
            </View>
          ))}
          <View style={styles.verificationHint}>
            <ThemedText style={styles.hintTitle}>不正防止</ThemedText>
            <ThemedText>
              ・学籍証明のアップロードはOCRで自動判定。疑義は手動レビューへ。{'\n'}・マッチ後のチャットは不審ワードを検知し、運営にアラートを送信。
            </ThemedText>
          </View>
        </ThemedView>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="title" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function Badge({ label, themeColor, subtle }: { label: string; themeColor: string; subtle?: boolean }) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: subtle ? 'transparent' : `${themeColor}1A`,
          borderColor: `${themeColor}60`,
        },
      ]}>
      <ThemedText style={styles.badgeText}>{label}</ThemedText>
    </View>
  );
}

function WeightChip({ label, value, themeColor }: { label: string; value: number; themeColor: string }) {
  return (
    <View style={[styles.weightChip, { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}50` }]}>
      <ThemedText style={styles.weightChipLabel}>{label}</ThemedText>
      <ThemedText style={styles.weightChipValue}>{Math.round(value * 100)}%</ThemedText>
    </View>
  );
}

function SelectionMarker({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.selectionMarker, selected ? styles.selectionMarkerActive : null]}>
      {selected ? <ThemedText style={styles.selectionMarkerText}>選択中</ThemedText> : <ThemedText>選択</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 18,
  },
  hero: {
    padding: 18,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
  },
  heroHeader: {
    gap: 6,
  },
  heroTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 24,
  },
  heroSubtitle: {
    lineHeight: 20,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
  },
  sectionSubtitle: {
    lineHeight: 20,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  campusCard: {
    flexBasis: '48%',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  cardMeta: {
    fontSize: 12,
  },
  cardPrograms: {
    fontSize: 12,
    lineHeight: 16,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
  },
  intentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  intentCard: {
    flexBasis: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  intentTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  intentDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
  },
  weightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  weightCard: {
    flexBasis: '48%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  weightChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  weightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  weightChipLabel: {
    fontSize: 12,
  },
  weightChipValue: {
    fontFamily: Fonts.mono,
  },
  summaryBox: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 6,
  },
  summaryTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  matchList: {
    gap: 10,
  },
  matchCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchSnippet: {
    lineHeight: 18,
  },
  matchMetaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  verificationBox: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  verificationHint: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  hintTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 14,
  },
  selectionMarker: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  selectionMarkerActive: {
    backgroundColor: '#0a7ea415',
    borderColor: '#0a7ea4',
  },
  selectionMarkerText: {
    fontSize: 12,
  },
});

