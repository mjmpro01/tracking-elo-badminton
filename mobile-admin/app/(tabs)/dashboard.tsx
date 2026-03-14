import { View, Text, StyleSheet, Pressable, SafeAreaView, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLatestTournament } from "../../lib/hooks/useTournaments";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { colors } from "../../theme/colors";
import { useAuthContext } from "../../providers/AuthProvider";

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { signOut, loading } = useAuthContext();
  const { data: latestTournament } = useLatestTournament();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avatar + title + actions */}
        <View style={styles.headerRow}>
        <View style={styles.headerAvatarWrapper}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarInitial}>A</Text>
          </View>
        </View>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, Director</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              // TODO: open notifications center
            }}
          >
            <MaterialIcons name="notifications-none" size={20} color={colors.textMainLight} />
          </Pressable>
          <Pressable
            style={[styles.iconButton, styles.iconButtonGhost]}
            disabled={loading}
            onPress={async () => {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
            }}
          >
            <MaterialIcons name="logout" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Tournament</Text>
        {latestTournament ? (
          <View style={styles.tournamentCard}>
            {latestTournament.cover_image_url ? (
              <Image
                source={{ uri: latestTournament.cover_image_url }}
                style={styles.tournamentCoverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.tournamentCoverPlaceholder}>
                <MaterialIcons name="emoji-events" size={32} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.tournamentCardContent}>
              <View style={styles.tournamentCardHeader}>
                <View style={styles.tournamentInfo}>
                  <Text style={styles.tournamentName}>{latestTournament.name}</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>
                      {latestTournament.status === "ongoing"
                        ? "In Progress"
                        : latestTournament.status === "finished"
                        ? "Finished"
                        : latestTournament.status === "upcoming"
                        ? "Upcoming"
                        : "Locked"}
                    </Text>
                  </View>
                  <View style={styles.tournamentMetaRow}>
                    <View style={styles.tournamentMetaItem}>
                      <MaterialIcons
                        name="groups"
                        size={14}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.tournamentMetaText}>Players</Text>
                    </View>
                    {latestTournament.start_date && (
                      <View style={styles.tournamentMetaItem}>
                        <MaterialIcons
                          name="calendar-today"
                          size={14}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.tournamentMetaText}>
                          Started {new Date(latestTournament.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Pressable
                  style={styles.manageButton}
                  onPress={() => {
                    navigation.navigate("TournamentDetail", {
                      id: latestTournament.id,
                    });
                  }}
                >
                  <Text style={styles.manageButtonText}>Manage</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.cardEmpty}>Không có tournament nào.</Text>
          </View>
        )}
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <Pressable
            style={styles.quickActionItem}
            onPress={() => {
              navigation.navigate("CreateTournamentStep1");
            }}
          >
            <View style={styles.quickActionIconWrapper}>
              <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Create Tournament</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionItem}
            onPress={() => {
              navigation.navigate("AddPlayerQuick");
            }}
          >
            <View style={styles.quickActionIconWrapper}>
              <MaterialIcons name="person-add-alt" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>Quick Add Player</Text>
          </Pressable>
        </View>
      </Card>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerAvatarWrapper: {
    marginRight: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarInitial: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 18,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  card: {
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardEmpty: {
    fontSize: 14,
    color: colors.textMuted,
  },
  currentCardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  currentMetaRow: {
    marginTop: 6,
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 4,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tournamentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tournamentCoverImage: {
    width: "100%",
    aspectRatio: 16 / 7,
    backgroundColor: colors.borderLight,
  },
  tournamentCoverPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 7,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  tournamentCardContent: {
    padding: 16,
  },
  tournamentCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  tournamentInfo: {
    flex: 1,
    gap: 4,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  tournamentMetaRow: {
    gap: 8,
  },
  tournamentMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tournamentMetaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  manageButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  manageButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 16,
    marginTop: 4,
  },
  quickActionItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  quickActionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    color: colors.textMainLight,
  },
});


