import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "../../providers/AuthProvider";
import { colors, lightColors } from "../../theme/colors";

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { signOut, loading } = useAuthContext();

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Huỷ",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: "Auth" }],
            });
          },
        },
      ],
    );
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="settings" size={24} color={colors.primary} />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <Pressable
            style={styles.notificationButton}
            onPress={() => {
              // TODO: open notifications center
            }}
          >
            <MaterialIcons
              name="notifications-none"
              size={24}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* Log Out Button */}
        <View style={styles.logoutSection}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <MaterialIcons name="logout" size={20} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>Version 2.4.0-stable</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundLight,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 16,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textMainLight,
    },
    notificationButton: {
      padding: 8,
      borderRadius: 20,
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      paddingHorizontal: 24,
      paddingBottom: 8,
    },
    settingsCard: {
      backgroundColor: colors.surfaceLight,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.borderLight,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 16,
      minHeight: 56,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      flex: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: colors.primary + "1A",
      alignItems: "center",
      justifyContent: "center",
    },
    settingInfo: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textMainLight,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },
    logoutSection: {
      paddingHorizontal: 24,
      paddingTop: 32,
    },
    logoutButton: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: "#fee2e2",
      borderWidth: 1,
      borderColor: "#fecaca",
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#dc2626",
    },
    versionText: {
      textAlign: "center",
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 24,
    },
  });
