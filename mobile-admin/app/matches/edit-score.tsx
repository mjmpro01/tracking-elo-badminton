import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { colors } from "../../theme/colors";
import { Button } from "../../components/ui/Button";
import { updateMatchScore } from "../../lib/api/matches";

type RouteParams = {
  matchId: string;
  tournamentId: string;
  entryAName: string;
  entryBName: string;
  scoreA?: number[] | null;
  scoreB?: number[] | null;
};

export default function EditMatchScoreScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { matchId, tournamentId, entryAName, entryBName } =
    route.params as RouteParams;
  const queryClient = useQueryClient();

  const initialScoreA =
    (route.params as RouteParams).scoreA && (route.params as RouteParams).scoreA!.length
      ? (route.params as RouteParams).scoreA!.join(",")
      : "";
  const initialScoreB =
    (route.params as RouteParams).scoreB && (route.params as RouteParams).scoreB!.length
      ? (route.params as RouteParams).scoreB!.join(",")
      : "";

  const [scoreA, setScoreA] = useState(initialScoreA);
  const [scoreB, setScoreB] = useState(initialScoreB);
  const [submitting, setSubmitting] = useState(false);

  const parseScores = (value: string): number[] => {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => Number(v))
      .filter((n) => !Number.isNaN(n));
  };

  const handleSave = async () => {
    if (submitting) return;
    const sA = parseScores(scoreA);
    const sB = parseScores(scoreB);
    if (sA.length === 0 || sB.length === 0 || sA.length !== sB.length) {
      Alert.alert(
        "Dữ liệu chưa hợp lệ",
        "Nhập điểm dạng ví dụ: 21,18,15 cho cả hai bên và số set phải bằng nhau.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await updateMatchScore({
        matchId,
        scoreA: sA,
        scoreB: sB,
      });
      // refresh danh sách matches & latest tournament
      queryClient.invalidateQueries({
        queryKey: ["tournament-matches", tournamentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["latestTournament"],
      });
      navigation.goBack();
    } catch (e: any) {
      console.error("updateMatchScore error", e);
      Alert.alert(
        "Lỗi",
        e?.message ?? "Không thể lưu kết quả. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>Enter Score</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Match</Text>
        <Text style={styles.matchTitle}>
          {entryAName} <Text style={styles.vsText}>vs</Text> {entryBName}
        </Text>

        <Text style={[styles.label, { marginTop: 24 }]}>
          Scores (comma separated)
        </Text>
        <Text style={styles.helper}>
          Ví dụ: 21,18 hoặc 21,18,15 – mỗi số là điểm của một set.
        </Text>

        <View style={{ marginTop: 12 }}>
          <Text style={styles.sideLabel}>{entryAName}</Text>
          <TextInput
            style={styles.input}
            placeholder="21,18,15"
            placeholderTextColor={colors.textSecondary}
            value={scoreA}
            onChangeText={setScoreA}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={styles.sideLabel}>{entryBName}</Text>
          <TextInput
            style={styles.input}
            placeholder="18,21,12"
            placeholderTextColor={colors.textSecondary}
            value={scoreB}
            onChangeText={setScoreB}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Save Result" onPress={handleSave} loading={submitting} />
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  matchTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  vsText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  helper: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sideLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMainLight,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textMainLight,
    backgroundColor: "#ffffff",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
});

