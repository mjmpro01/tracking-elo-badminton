import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { useTournaments } from "../../lib/hooks/useTournaments";
import { TournamentStatus } from "../../lib/api/tournaments";
import { Card } from "../../components/ui/Card";
import { ListItem } from "../../components/ui/ListItem";
import { colors } from "../../theme/colors";

type FilterValue = TournamentStatus | undefined;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: undefined },
  { label: "Upcoming", value: "upcoming" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Finished", value: "finished" },
  { label: "Locked", value: "locked" },
];

export default function TournamentsScreen() {
  const navigation = useNavigation<any>();
  const [statusFilter, setStatusFilter] = useState<FilterValue>(undefined);
  const {
    data: tournaments,
    isLoading,
    isFetching,
    refetch,
  } = useTournaments(statusFilter);

  const handleRefresh = () => {
    refetch();
  };

  const renderStatusBadge = (status: TournamentStatus) => {
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
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Tournaments</Text>
            <Text style={styles.subtitle}>
              Quản lý tournaments và điều hướng tới chi tiết.
            </Text>
          </View>
        </View>

        <Card style={styles.filtersCard}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Status</Text>
        </View>
        <View style={styles.filtersChipsRow}>
          {FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;
            return (
              <Pressable
                key={filter.label}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setStatusFilter(filter.value)}
              >
                <Text
                  style={[
                    styles.chipLabel,
                    isActive && styles.chipLabelActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.listCard}>
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>Danh sách tournaments</Text>
          {isFetching && !isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải tournaments...</Text>
          </View>
        ) : (
          <FlatList
            data={tournaments ?? []}
            keyExtractor={(item) => `${item.id}-${item.cover_image_url || "no-cover"}`}
            refreshing={isFetching}
            onRefresh={handleRefresh}
            contentContainerStyle={
              (tournaments ?? []).length === 0
                ? styles.emptyListContainer
                : undefined
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Không có tournament nào với bộ lọc hiện tại.
              </Text>
            }
            renderItem={({ item }) => {
              const hasCoverImage =
                item.cover_image_url &&
                typeof item.cover_image_url === "string" &&
                item.cover_image_url.trim().length > 0;

              // Debug log
              console.log(
                `[Tournaments] ${item.name}: cover_image_url =`,
                item.cover_image_url,
                "hasCoverImage =",
                hasCoverImage,
              );

              return (
                <ListItem
                  title={item.name}
                  subtitle={
                    item.start_date
                      ? `${item.format} · k=${item.k_factor}`
                      : item.format
                  }
                  left={
                    hasCoverImage ? (
                      <Image
                        source={{ uri: item.cover_image_url }}
                        style={styles.coverThumb}
                        resizeMode="cover"
                        onError={(e) => {
                          console.error(
                            "[Tournaments] Failed to load cover image:",
                            item.name,
                            item.cover_image_url,
                            e.nativeEvent.error,
                          );
                        }}
                        onLoad={() => {
                          console.log(
                            "[Tournaments] Successfully loaded cover image:",
                            item.name,
                            item.cover_image_url,
                          );
                        }}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <MaterialIcons
                          name="emoji-events"
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                    )
                  }
                  right={renderStatusBadge(item.status)}
                  onPress={() =>
                    navigation.navigate("TournamentDetail", { id: item.id })
                  }
                />
              );
            }}
          />
        )}
      </Card>
      </View>

      {/* Floating Add button */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          navigation.navigate("CreateTournamentStep1");
        }}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  filtersCard: {
    marginBottom: 12,
  },
  filtersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
  },
  filtersChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
  },
  chipActive: {
    backgroundColor: colors.primary + "11",
    borderColor: colors.primary,
  },
  chipLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipLabelActive: {
    color: colors.primary,
    fontWeight: "600",
  },
  listCard: {
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  loadingWrapper: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyListContainer: {
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  coverThumb: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.borderLight,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + "11",
    alignItems: "center",
    justifyContent: "center",
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

