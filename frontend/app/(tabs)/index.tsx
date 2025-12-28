import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useApiClient } from "@/providers/ApiProvider";
import type {
  CampusRecord,
  IntentOption,
  WeightPreset,
} from "@/services/mockApi";

const matchIdeas = [
  {
    id: "m1",
    title: "同じ専門でゼミ相談",
    snippet: "情報系専攻同士。研究テーマ・インターン情報を交換。",
    matchRate: 92,
  },
  {
    id: "m2",
    title: "合同サークルイベント",
    snippet: "関東エリアの大学横断でボランティア企画を共催。",
    matchRate: 87,
  },
  {
    id: "m3",
    title: "留学経験シェア",
    snippet: "交換留学経験者と出発前の学生をペアリング。",
    matchRate: 79,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { openapi } = useApiClient();
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [intent, setIntent] = useState("");
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(true);
  const [enableSmartRotation, setEnableSmartRotation] = useState(true);
  const [presetKey, setPresetKey] = useState("");
  const hasAppliedDefaults = useRef(false);

  const campusQuery = openapi.useQuery("get", "/catalog/universities", {});
  const configurationQuery = openapi.useQuery(
    "get",
    "/catalog/configuration",
    {}
  );

  const campusCatalog: CampusRecord[] = (campusQuery.data?.results ?? []).map(
    ({ country: _country, website: _website, ...rest }) => rest
  );
  const intentOptions: IntentOption[] = configurationQuery.data?.intents ?? [];
  const weightPresets: WeightPreset[] =
    configurationQuery.data?.weightPresets ?? [];
  const verificationOptions = (
    configurationQuery.data?.verificationFlags ?? []
  ).map((flag) => flag.label);
  const isLoading = campusQuery.isLoading || configurationQuery.isLoading;
  const error =
    campusQuery.error || configurationQuery.error
      ? "設定データの取得に失敗しました。再読み込みしてください。"
      : null;

  const activePreset = useMemo(() => {
    return (
      weightPresets.find((preset) => preset.id === presetKey) ||
      weightPresets[0] || {
        id: "default",
        title: "重み付け未設定",
        note: "設定データの取得をお待ちください",
        isActive: false,
        weights: { major: 0, campus: 0, activity: 0 },
      }
    );
  }, [presetKey, weightPresets]);

  useEffect(() => {
    if (hasAppliedDefaults.current) return;
    if (
      !campusCatalog.length &&
      !intentOptions.length &&
      !weightPresets.length &&
      !verificationOptions.length
    ) {
      return;
    }

    setSelectedTargets((prev) =>
      prev.length > 0
        ? prev
        : campusCatalog.slice(0, 2).map((campus) => campus.id)
    );
    setIntent((prev) => (prev ? prev : intentOptions[0]?.id ?? ""));
    setPresetKey((prev) => (prev ? prev : weightPresets[0]?.id ?? ""));
    setIsVerifiedOnly(
      configurationQuery.data?.verificationFlags?.some(
        (flag) => flag.required
      ) ?? true
    );
    hasAppliedDefaults.current = true;
  }, [
    campusCatalog,
    intentOptions,
    weightPresets,
    verificationOptions,
    configurationQuery.data,
  ]);

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const theme = Colors[colorScheme ?? "light"];

  if (isLoading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <ThemedView
          style={[styles.placeholderBox, { borderColor: theme.icon }]}
        >
          <ThemedText>設定データを読み込んでいます...</ThemedText>
        </ThemedView>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {error ? (
        <ThemedView
          style={[
            styles.errorBox,
            { borderColor: theme.tint, backgroundColor: `${theme.tint}10` },
          ]}
        >
          <ThemedText type="subtitle" style={styles.errorTitle}>
            データ取得エラー
          </ThemedText>
          <ThemedText>{error}</ThemedText>
          <Pressable
            onPress={() => {
              campusQuery.refetch();
              configurationQuery.refetch();
            }}
            style={[styles.retryButton, { borderColor: theme.tint }]}
          >
            <ThemedText style={[styles.retryLabel, { color: theme.tint }]}>
              再読み込み
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : null}

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
                  borderColor: selectedTargets.includes(campus.id)
                    ? theme.tint
                    : theme.icon,
                  backgroundColor: selectedTargets.includes(campus.id)
                    ? `${theme.tint}15`
                    : "transparent",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {campus.name}
              </ThemedText>
              <ThemedText style={styles.cardMeta}>{campus.city}</ThemedText>
              <View style={styles.tagRow}>
                {campus.tags.map((tag) => (
                  <Badge key={tag} label={tag} themeColor={theme.icon} subtle />
                ))}
              </View>
              <ThemedText style={styles.cardPrograms}>
                主要プログラム: {campus.programs.join(", ")}
              </ThemedText>
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
              key={option.id}
              onPress={() => setIntent(option.id)}
              style={({ pressed }) => [
                styles.intentCard,
                {
                  borderColor: intent === option.id ? theme.tint : theme.icon,
                  backgroundColor:
                    intent === option.id ? `${theme.tint}12` : "transparent",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.intentTitle}>
                {option.label}
              </ThemedText>
              <ThemedText style={styles.intentDescription}>
                {option.description}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <View style={styles.switchRow}>
          <Switch value={isVerifiedOnly} onValueChange={setIsVerifiedOnly} />
          <ThemedText style={styles.switchLabel}>
            本人確認済みユーザーのみ許可
          </ThemedText>
        </View>
        <View style={styles.switchRow}>
          <Switch
            value={enableSmartRotation}
            onValueChange={setEnableSmartRotation}
          />
          <ThemedText style={styles.switchLabel}>
            マッチ候補のスマートローテーション
          </ThemedText>
        </View>
      </Section>

      <Section title="運営用アルゴリズムコントロール">
        <ThemedText style={styles.sectionSubtitle}>
          重み付けプリセットを用意し、運営がイベントや季節に応じて切り替え可能。サマリーはリアルタイムで表示します。
        </ThemedText>
        <View style={styles.weightRow}>
          {weightPresets.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => setPresetKey(preset.id)}
              style={({ pressed }) => [
                styles.weightCard,
                {
                  borderColor:
                    presetKey === preset.id ? theme.tint : theme.icon,
                  backgroundColor:
                    presetKey === preset.id ? `${theme.tint}10` : "transparent",
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {preset.title}
              </ThemedText>
              <ThemedText style={styles.cardMeta}>{preset.note}</ThemedText>
              <View style={styles.weightChips}>
                <WeightChip
                  label="専攻"
                  value={preset.weights.major}
                  themeColor={theme.tint}
                />
                <WeightChip
                  label="エリア"
                  value={preset.weights.campus}
                  themeColor={theme.tint}
                />
                <WeightChip
                  label="活動"
                  value={preset.weights.activity}
                  themeColor={theme.tint}
                />
              </View>
            </Pressable>
          ))}
        </View>
        <ThemedView style={styles.summaryBox}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            現在のロジック概要
          </ThemedText>
          <ThemedText>
            ・ターゲット大学: {selectedTargets.length}校 / 意図:{" "}
            {intentOptions.find((opt) => opt.id === intent)?.label}
          </ThemedText>
          <ThemedText>
            ・本人確認:{" "}
            {isVerifiedOnly
              ? "必須 (大学メール + 学籍証明)"
              : "任意 (手動チェック)"}
          </ThemedText>
          <ThemedText>
            ・ローテーション:{" "}
            {enableSmartRotation
              ? "人気大学の集中を緩和して分散表示"
              : "新着順で表示"}
          </ThemedText>
          <ThemedText>
            ・重み付け: 専攻 {Math.round(activePreset.weights.major * 100)}% /
            エリア
            {` ${Math.round(
              activePreset.weights.campus * 100
            )}% / 活動 ${Math.round(activePreset.weights.activity * 100)}%`}
          </ThemedText>
        </ThemedView>
      </Section>

      <Section title="次のステップ">
        <ThemedText style={styles.sectionSubtitle}>
          実際の操作フローに沿って、新しい画面へ遷移できます。本人確認やマッチ結果の確認、運営向け重み設定を試してみてください。
        </ThemedText>
        <View style={styles.actionGrid}>
          <Pressable
            onPress={() => router.push("/matches")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: `${theme.tint}12`,
                borderColor: theme.tint,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              マッチ結果を確認
            </ThemedText>
            <ThemedText style={styles.actionBody}>
              条件に基づくサンプルマッチカードを一覧で確認し、本人確認済みのペアリングをチェックします。
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/verify/email-otp")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: `${theme.icon}10`,
                borderColor: theme.icon,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              大学メールを認証
            </ThemedText>
            <ThemedText style={styles.actionBody}>
              学内メールへ6桁コードを送信し、OTPで学生本人かを確かめるフローをデモします。
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/admin/weights")}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: "transparent",
                borderColor: `${theme.icon}60`,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.cardTitle}>
              重み付けプリセットを調整
            </ThemedText>
            <ThemedText style={styles.actionBody}>
              季節やイベントに合わせてプリセットを切り替え、本人確認ポリシーの厳格さも操作できます。
            </ThemedText>
          </Pressable>
        </View>
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
                <Badge
                  label={`適合度 ${idea.matchRate}%`}
                  themeColor={theme.tint}
                />
              </View>
              <ThemedText style={styles.matchSnippet}>
                {idea.snippet}
              </ThemedText>
              <View style={styles.matchMetaRow}>
                <Badge label="本人確認済" themeColor={theme.icon} subtle />
                <Badge
                  label={
                    intentOptions.find((opt) => opt.id === intent)?.label ?? ""
                  }
                  themeColor={theme.icon}
                  subtle
                />
                <Badge
                  label={`対象 ${selectedTargets.length}校`}
                  themeColor={theme.icon}
                  subtle
                />
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
              ・学籍証明のアップロードはOCRで自動判定。疑義は手動レビューへ。
              {"\n"}
              ・マッチ後のチャットは不審ワードを検知し、運営にアラートを送信。
            </ThemedText>
          </View>
        </ThemedView>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="title" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function Badge({
  label,
  themeColor,
  subtle,
}: {
  label: string;
  themeColor: string;
  subtle?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: subtle ? "transparent" : `${themeColor}1A`,
          borderColor: `${themeColor}60`,
        },
      ]}
    >
      <ThemedText style={styles.badgeText}>{label}</ThemedText>
    </View>
  );
}

function WeightChip({
  label,
  value,
  themeColor,
}: {
  label: string;
  value: number;
  themeColor: string;
}) {
  return (
    <View
      style={[
        styles.weightChip,
        { backgroundColor: `${themeColor}15`, borderColor: `${themeColor}50` },
      ]}
    >
      <ThemedText style={styles.weightChipLabel}>{label}</ThemedText>
      <ThemedText style={styles.weightChipValue}>
        {Math.round(value * 100)}%
      </ThemedText>
    </View>
  );
}

function SelectionMarker({ selected }: { selected: boolean }) {
  return (
    <View
      style={[
        styles.selectionMarker,
        selected ? styles.selectionMarkerActive : null,
      ]}
    >
      {selected ? (
        <ThemedText style={styles.selectionMarkerText}>選択中</ThemedText>
      ) : (
        <ThemedText>選択</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 18,
  },
  placeholderBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  errorBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  errorTitle: {
    fontFamily: Fonts.rounded,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
  },
  retryLabel: {
    fontWeight: "600",
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  actionGrid: {
    gap: 12,
  },
  actionCard: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  actionBody: {
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
  },
  sectionSubtitle: {
    lineHeight: 20,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  campusCard: {
    flexBasis: "48%",
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
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
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
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  intentCard: {
    flexBasis: "48%",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
  },
  weightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  weightCard: {
    flexBasis: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  weightChips: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  weightChip: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  matchSnippet: {
    lineHeight: 18,
  },
  matchMetaRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  verificationBox: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
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
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  selectionMarkerActive: {
    backgroundColor: "#0a7ea415",
    borderColor: "#0a7ea4",
  },
  selectionMarkerText: {
    fontSize: 12,
  },
});
