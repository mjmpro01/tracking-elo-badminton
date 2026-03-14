import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../../../theme/colors";
import { Button } from "../../../components/ui/Button";

type PlayerSeed = {
  id: string;
  name: string;
  rating: number | null;
  avatarUrl: string | null;
};

export default function CreateTournamentStep3DoublesScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const playersFromStep2: PlayerSeed[] = route.params?.players ?? [];

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
        <Text style={styles.headerTitle}>Doubles Setup</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Stepper */}
      <View style={styles.stepperRow}>
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={styles.stepBar} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Tournament type toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tournament Type</Text>
            <View style={styles.typeToggle}>
              <Pressable style={styles.typePill}>
                <Text style={styles.typePillText}>Singles</Text>
              </Pressable>
              <Pressable style={[styles.typePill, styles.typePillActive]}>
                <Text style={[styles.typePillText, styles.typePillTextActive]}>
                  Doubles
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Title + description */}
          <View style={styles.section}>
            <Text style={styles.title}>Participant Setup</Text>
            <Text style={styles.subtitle}>
              Confirm player entries or configure doubles pairings for the event.
            </Text>
          </View>

          {/* Auto-generate button */}
          <View style={styles.section}>
            <Button
              title="Auto-generate Balanced Teams"
              onPress={() => {}}
            />
            <Text style={styles.helperText}>
              Uses combined Elo ratings to create fair matchups
            </Text>
          </View>

          {/* Example teams */}
          <View style={styles.section}>
            <View style={styles.teamsHeaderRow}>
              <Text style={styles.teamsTitle}>Teams Created (4/8)</Text>
              <Text style={styles.addManuallyText}>Add Manually</Text>
            </View>

            <View style={styles.teamCardPrimary}>
              <View style={styles.teamCardHeader}>
                <Text style={styles.teamSeedBadgePrimary}>Seed #1</Text>
                <Text style={styles.combinedEloLabel}>
                  Combined Elo: <Text style={styles.combinedEloValue}>2450</Text>
                </Text>
              </View>
              <View style={styles.teamPlayerRow}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>MJ</Text>
                </View>
                <View style={styles.teamPlayerInfo}>
                  <Text style={styles.teamPlayerName}>Marcus Johnson</Text>
                  <Text style={styles.teamPlayerRating}>Elo 1250</Text>
                </View>
                <MaterialIcons
                  name="remove-circle-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.teamDivider} />
              <View style={styles.teamPlayerRow}>
                <View style={styles.teamAvatar}>
                  <Text style={styles.teamAvatarText}>SW</Text>
                </View>
                <View style={styles.teamPlayerInfo}>
                  <Text style={styles.teamPlayerName}>Sarah Williams</Text>
                  <Text style={styles.teamPlayerRating}>Elo 1200</Text>
                </View>
                <MaterialIcons
                  name="remove-circle-outline"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Unassigned players từ Step 2 */}
          <View style={styles.section}>
            <Text style={styles.unassignedTitle}>
              Unassigned Players ({playersFromStep2.length})
            </Text>
            <View style={styles.unassignedCard}>
              {playersFromStep2.map((player) => {
                const initials = player.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase();

                return (
                  <View key={player.id} style={styles.unassignedRow}>
                    <View
                      style={[
                        styles.unassignedAvatar,
                        styles.unassignedAvatarPurple,
                      ]}
                    >
                      <Text style={styles.unassignedAvatarText}>{initials}</Text>
                    </View>
                    <View style={styles.unassignedInfo}>
                      <Text style={styles.unassignedName}>{player.name}</Text>
                      <Text style={styles.unassignedRating}>
                        Elo {player.rating ?? "—"}
                      </Text>
                    </View>
                    <View style={styles.unassignedAddButton}>
                      <MaterialIcons
                        name="add"
                        size={18}
                        color={colors.textMainLight}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <View style={[styles.footerButton, styles.footerBackButton]}>
            <Button
              title="Back"
              onPress={() => navigation.goBack()}
              variant="ghost"
            />
          </View>
          <Button
            title="Continue"
            onPress={() => navigation.navigate("TournamentReviewDoubles")}
            style={styles.footerButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderLight,
  },
  stepBarActive: {
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  typeToggle: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    padding: 3,
  },
  typePill: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typePillActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  typePillText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  typePillTextActive: {
    color: colors.primary,
  },
  teamsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  addManuallyText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  teamCardPrimary: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  teamCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  teamSeedBadgePrimary: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  combinedEloLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  combinedEloValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  teamPlayerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  teamDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 4,
    marginLeft: 48,
  },
  teamAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  teamAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  teamPlayerInfo: {
    flex: 1,
  },
  teamPlayerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  teamPlayerRating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unassignedTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  unassignedCard: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 8,
  },
  unassignedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  unassignedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  unassignedAvatarPurple: {
    backgroundColor: "#EDE9FE",
  },
  unassignedAvatarGreen: {
    backgroundColor: "#DCFCE7",
  },
  unassignedAvatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  unassignedInfo: {
    flex: 1,
  },
  unassignedName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMainLight,
  },
  unassignedRating: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  unassignedAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  footerBackButton: {
    backgroundColor: "#6B7280",
    borderRadius: 999,
    overflow: "hidden",
  },
});

