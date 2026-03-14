import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { useTournament } from "../../../lib/hooks/useTournaments";
import { Card } from "../../../components/ui/Card";
import { colors } from "../../../theme/colors";

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const {
    data: tournament,
    isLoading,
    isError,
    error,
  } = useTournament(id);

  const renderStatusBadge = (status: string) => {
    let label = status;
    let background = "#e5e7eb";
    let textColor = colors.textSecondary;

    switch (status) {
      case "upcoming":
        label = "Upcoming";
        background = "#dbeafe";
        textColor = colors.primary;
        break;
      case "ongoing":
        label = "Ongoing";
        background = "#dcfce7";
        textColor = colors.success;
        break;
      case "finished":
        label = "Finished";
        background = "#e5e7eb";
        textColor = colors.textSecondary;
        break;
      case "locked":
        label = "Locked";
        background = "#fee2e2";
        textColor = colors.error;
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: background }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>
          {label}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={colors.textMainLight}
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Tournament Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={styles.card}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.helperText}>Đang tải thông tin tournament...</Text>
          </View>
        ) : isError || !tournament ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>
              Không tải được tournament.{" "}
              {error instanceof Error ? error.message : ""}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{tournament.name}</Text>
              {renderStatusBadge(tournament.status)}
            </View>
            <Text style={styles.meta}>
              {tournament.format} · k={tournament.k_factor}
            </Text>
            {tournament.start_date ? (
              <Text style={styles.metaSecondary}>
                Start: {tournament.start_date}
              </Text>
            ) : null}
            {tournament.end_date ? (
              <Text style={styles.metaSecondary}>
                End: {tournament.end_date}
              </Text>
            ) : null}
            <View style={styles.divider} />
            <Text style={styles.helperText}>
              Các action chi tiết (tạo match, standings, finalize rankings) sẽ
              được bổ sung ở các phase tiếp theo.
            </Text>
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  card: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMainLight,
    flex: 1,
    marginRight: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metaSecondary: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

