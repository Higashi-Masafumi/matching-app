import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useApiClient } from "@/providers/ApiProvider";
import type { CampusRecord, IntentOption } from "@/services/mockApi";

const sampleMatches = [
  {
    id: "mx1",
    title: "AI/データサイエンス連携",
    summary: "東大・東北大の情報系学生で共同勉強会を開催。",
    details: ["本人確認済み", "専攻の一致度 92%", "距離フィルター: 関東・東北"],
  },
  {
    id: "mx2",
    title: "国際交流イベントの共同企画",
    summary: "早稲田・上智・青学の国際系サークルでボランティア企画を共催。",
    details: ["本人確認済み", "活動タグ: 国際交流", "対象大学 3校"],
  },
  {
    id: "mx3",
    title: "ゼミ横断の研究トーク",
    summary: "関西圏の理系ゼミが研究テーマを共有し、共同発表を準備。",
    details: [
      "本人確認済み",
      "専攻の一致度 84%",
      "ローテーション: スマート表示",
    ],
  },
];

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { openapi } = useApiClient();
  const campusQuery = openapi.useQuery("get", "/catalog/universities", {});
  const configurationQuery = openapi.useQuery(
    "get",
    "/catalog/configuration",
    {},
  );

  const campusCatalog: CampusRecord[] = (campusQuery.data?.results ?? []).map(
    ({ country: _country, website: _website, ...rest }) => rest,
  );
  const intentOptions: IntentOption[] = useMemo(
    () => configurationQuery.data?.intents ?? [],
    [configurationQuery.data?.intents],
  );
  const isLoading = campusQuery.isLoading || configurationQuery.isLoading;
  const error =
    campusQuery.error || configurationQuery.error
      ? "マッチデータの取得に失敗しました。再読み込みしてください。"
      : null;

  const primaryIntent = useMemo(
    () => intentOptions[0]?.label ?? "交流",
    [intentOptions],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <ThemedView style={[styles.infoBox, { borderColor: theme.icon }]}>
          <ThemedText>マッチ候補を読み込んでいます...</ThemedText>
        </ThemedView>
      ) : null}

      {error ? (
        <ThemedView
          style={[
            styles.infoBox,
            { borderColor: theme.tint, backgroundColor: `${theme.tint}10` },
          ]}
        >
          <ThemedText type="subtitle" style={styles.boxTitle}>
            データ取得エラー
          </ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : null}

      <ThemedView style={[styles.hero, { borderColor: theme.icon }]}>
        <ThemedText type="title" style={styles.heroTitle}>
          マッチ結果一覧
        </ThemedText>
        <ThemedText style={styles.heroSubtitle}>
          Homeで設定した対象大学や意図をもとに生成されたサンプル結果です。本人確認済みのユーザーのみを表示します。
        </ThemedText>
        <View style={styles.badgeRow}>
          <Badge
            label={`対象大学: 約${campusCatalog.length || 8}校`}
            themeColor={theme.icon}
            subtle
          />
          <Badge
            label={`意図: ${primaryIntent}`}
            themeColor={theme.icon}
            subtle
          />
          <Badge label="本人確認必須" themeColor={theme.tint} />
        </View>
      </ThemedView>

      <Section title="マッチ候補">
        <ThemedText style={styles.sectionSubtitle}>
          各カードはターゲット大学や専攻、活動タグを元に作られたイメージです。本人確認済みステータスを維持したまま表示されます。
        </ThemedText>
        <View style={styles.cardList}>
          {sampleMatches.map((match) => (
            <ThemedView
              key={match.id}
              style={[styles.matchCard, { borderColor: theme.icon }]}
            >
              <View style={styles.matchHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {match.title}
                </ThemedText>
                <Badge label="本人確認済" themeColor={theme.tint} />
              </View>
              <ThemedText style={styles.matchSummary}>
                {match.summary}
              </ThemedText>
              <View style={styles.metaRow}>
                {match.details.map((detail) => (
                  <Badge
                    key={detail}
                    label={detail}
                    themeColor={theme.icon}
                    subtle
                  />
                ))}
              </View>
            </ThemedView>
          ))}
        </View>
      </Section>

      <Section title="次のアクション">
        <ThemedText style={styles.sectionSubtitle}>
          重み付けの見直しや本人確認フローを別画面で試せます。設定変更後に再度ここへ戻ると、想定される結果の変化を確認できます。
        </ThemedText>
        <View style={styles.actionRow}>
          <ActionButton
            label="重み付けを変更"
            accent={theme.tint}
            onPress={() => router.push("/admin/weights")}
          />
          <ActionButton
            label="大学メールを確認"
            accent={theme.icon}
            onPress={() => router.push("/verify/email-otp")}
          />
        </View>
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
          backgroundColor: subtle ? "transparent" : `${themeColor}12`,
          borderColor: `${themeColor}50`,
        },
      ]}
    >
      <ThemedText style={styles.badgeText}>{label}</ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  accent,
  onPress,
}: {
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          borderColor: accent,
          backgroundColor: `${accent}12`,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <ThemedText type="subtitle" style={styles.actionButtonText}>
        {label}
      </ThemedText>
      <ThemedText style={styles.actionHint}>画面遷移して詳細を確認</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  infoBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  boxTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
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
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 14,
    gap: 10,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
  },
  sectionSubtitle: {
    lineHeight: 18,
  },
  cardList: {
    gap: 10,
  },
  matchCard: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  matchHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  matchSummary: {
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.rounded,
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 4,
    minWidth: "48%",
  },
  actionButtonText: {
    fontFamily: Fonts.rounded,
    fontSize: 15,
  },
  actionHint: {
    fontSize: 12,
    color: "#555",
  },
});
