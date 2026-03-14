import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { colors } from "../../theme/colors";
import {
  fetchTournamentStandings,
  StandingRow,
  saveFinalStandings,
} from "../../lib/api/standings";

type RouteParams = {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus?: string;
};

export default function FinalizeRankingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { tournamentId, tournamentName, tournamentStatus } =
    route.params as RouteParams;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<StandingRow[]>({
    queryKey: ["tournament-standings-live", tournamentId],
    queryFn: () => fetchTournamentStandings(tournamentId),
  });

  const [rows, setRows] = useState<StandingRow[]>(() => data ?? []);
  const [submitting, setSubmitting] = useState(false);

  const isReadOnly = tournamentStatus === "finished";

  React.useEffect(() => {
    if (data) {
      setRows(data);
    }
  }, [data]);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();

  const moveRow = (index: number, direction: -1 | 1) => {
    if (isReadOnly) return;
    setRows((prev) => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = tmp;
      return next.map((r, i) => ({ ...r, position: i + 1 }));
    });
  };

  const renderAvatar = (row: StandingRow) => {
    if (row.isDoubles && row.members && row.members.length > 1) {
      const m1 = row.members[0];
      const m2 = row.members[1];
      return (
        <View style={styles.teamAvatarStack}>
          {m1 &&
            (m1.avatarUrl ? (
              <Image
                source={{ uri: m1.avatarUrl }}
                style={[styles.teamAvatarImage, styles.teamAvatarCircleLeft]}
              />
            ) : (
              <View
                style={[styles.teamAvatarCircle, styles.teamAvatarCircleLeft]}
              >
                <Text style={styles.avatarText}>{getInitials(m1.name)}</Text>
              </View>
            ))}
          {m2 &&
            (m2.avatarUrl ? (
              <Image
                source={{ uri: m2.avatarUrl }}
                style={[styles.teamAvatarImage, styles.teamAvatarCircleRight]}
              />
            ) : (
              <View
                style={[styles.teamAvatarCircle, styles.teamAvatarCircleRight]}
              >
                <Text style={styles.avatarText}>{getInitials(m2.name)}</Text>
              </View>
            ))}
        </View>
      );
    }

    if (row.avatarUrl) {
      return (
        <Image
          source={{ uri: row.avatarUrl }}
          style={styles.playerAvatarImage}
        />
      );
    }

    return (
      <View style={styles.playerAvatarCircle}>
        <Text style={styles.avatarText}>{getInitials(row.name)}</Text>
      </View>
    );
  };

  const renderRow = (row: StandingRow, index: number) => {
    const position = index + 1;
    const isDimmed = position > 4;

    const isGold = position === 1;
    const isSilver = position === 2;
    const isBronze = position === 3;

    return (
      <View
        key={row.entryId}
        style={[
          styles.card,
          isDimmed && { opacity: 0.8 },
          isGold && styles.cardGold,
          isSilver && styles.cardSilver,
          isBronze && styles.cardBronze,
        ]}
      >
        <View style={styles.rowLeft}>
          <View style={styles.positionCell}>
            {isGold || isSilver || isBronze ? (
              <MaterialIcons
                name="emoji-events"
                size={20}
                color={
                  isGold
                    ? "#F59E0B"
                    : isSilver
                    ? "#9CA3AF"
                    : "#B45309"
                }
              />
            ) : (
              <Text style={styles.positionText}>{position}</Text>
            )}
          </View>
          <View style={styles.participantBlock}>
            {renderAvatar(row)}
            <View>
              <Text style={styles.participantName}>{row.name}</Text>
              <Text style={styles.participantMeta}>
                Record:{" "}
                <Text style={styles.recordValue}>
                  {row.wins}-{row.losses}
                </Text>
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightBlock}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{row.points}</Text>
          <View style={styles.moveButtons}>
            <Pressable
              style={styles.moveButton}
              onPress={() => moveRow(index, -1)}
              hitSlop={8}
              disabled={index === 0 || isReadOnly}
            >
              <MaterialIcons
                name="arrow-upward"
                size={22}
                color={
                  index === 0 || isReadOnly ? "#9CA3AF" : "#16A34A"
                }
              />
            </Pressable>
            <Pressable
              style={styles.moveButton}
              onPress={() => moveRow(index, 1)}
              hitSlop={8}
              disabled={index === rows.length - 1 || isReadOnly}
            >
              <MaterialIcons
                name="arrow-downward"
                size={22}
                color={
                  index === rows.length - 1 || isReadOnly
                    ? "#9CA3AF"
                    : "#DC2626"
                }
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const performSave = async () => {
    try {
      setSubmitting(true);
      // đảm bảo position đúng theo thứ tự hiện tại
      const payload = rows.map((r, idx) => ({ ...r, position: idx + 1 }));
      await saveFinalStandings({ tournamentId, rows: payload });
      // refresh live standings + tournament list + chi tiết tournament
      queryClient.invalidateQueries({
        queryKey: ["tournament-standings-live", tournamentId],
      });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
      Alert.alert("Thành công", "Đã lưu Final Rankings và kết thúc giải.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e: any) {
      console.error("saveFinalStandings error", e);
      Alert.alert(
        "Lỗi",
        e?.message ?? "Không thể lưu Final Rankings. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (submitting || isReadOnly) return;
    if (!rows.length) {
      Alert.alert("Không có dữ liệu", "Chưa có standings để lưu.");
      return;
    }

    const top3 = rows.slice(0, 3);
    const summaryLines = top3.map(
      (r, idx) => `${idx + 1}. ${r.name} (${r.points} pts${r.elo != null ? ` • Elo ${r.elo}` : ""})`,
    );
    const summary =
      top3.length > 0
        ? `Top 3 hiện tại:\n${summaryLines.join(
            "\n",
          )}\n\nBạn chắc chắn muốn kết thúc giải và xác nhận thứ hạng cuối cùng?`
        : "Bạn chắc chắn muốn kết thúc giải và xác nhận thứ hạng cuối cùng?";

    Alert.alert("Xác nhận kết thúc giải", summary, [
      {
        text: "Huỷ",
        style: "cancel",
      },
      {
        text: "Xác nhận",
        style: "destructive",
        onPress: () => {
          void performSave();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colors.textMainLight}
          />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center", marginRight: 32 }}>
          <Text style={styles.headerTitle}>{tournamentName}</Text>
          <Text style={styles.headerSubtitle}>Finalize Rankings</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Info banner */}
      <View style={styles.infoBanner}>
        <MaterialIcons
          name="drag_indicator"
          size={16}
          color={colors.primary}
          style={{ marginTop: 2 }}
        />
        <Text style={styles.infoText}>
          {isReadOnly
            ? "Giải đã kết thúc. Đây là bảng xếp hạng cuối cùng (chỉ xem)."
            : "Dùng nút mũi tên để điều chỉnh lại thứ hạng nếu cần. Thứ tự này sẽ được dùng cho tính Elo cuối giải."}
        </Text>
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.loadingWrapper}>
          <Text style={styles.errorText}>
            Không tải được standings. Vui lòng thử lại.
          </Text>
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.loadingWrapper}>
          <Text style={styles.emptyText}>Chưa có standings cho giải này.</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {rows.map(renderRow)}
        </ScrollView>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfoRow}>
          <Text style={styles.footerInfoText}>
            {rows.length} entries ranked
          </Text>
          <Text style={styles.footerInfoText}>Auto-sorted by Points</Text>
        </View>
        {!isReadOnly && (
          <Pressable
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={submitting || rows.length === 0}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <MaterialIcons name="lock" size={18} color="#ffffff" />
                <Text style={styles.confirmButtonText}>
                  Confirm Final Rankings
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#DBEAFE",
    borderBottomWidth: 1,
    borderBottomColor: "#BFDBFE",
  },
  infoText: {
    fontSize: 12,
    color: "#1D4ED8",
    flex: 1,
  },
  loadingWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  positionCell: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  participantBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  playerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },
  playerAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  teamAvatarStack: {
    flexDirection: "row",
    marginRight: 4,
  },
  teamAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  teamAvatarCircleLeft: {},
  teamAvatarCircleRight: {
    marginLeft: -10,
  },
  teamAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  participantName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  participantMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  recordValue: {
    fontWeight: "600",
    color: colors.textMainLight,
  },
  rightBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  pointsLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    color: colors.textSecondary,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  moveButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  moveButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  cardGold: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  cardSilver: {
    backgroundColor: "#E5E7EB",
    borderColor: "#9CA3AF",
  },
  cardBronze: {
    backgroundColor: "#FFEDD5",
    borderColor: "#B45309",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  footerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  footerInfoText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});

