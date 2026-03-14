import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Image,
  Pressable,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useQueryClient } from "@tanstack/react-query";

import { colors } from "../../theme/colors";
import { Button } from "../../components/ui/Button";
import { createPlayer } from "../../lib/api/players";
import { supabase } from "../../lib/supabase";

export default function AddPlayerQuickScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [initialElo, setInitialElo] = useState("");
  const [isMember, setIsMember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const canSubmit = fullName.trim().length > 0 && !loading;

  const handlePickAvatar = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to upload an avatar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error("pick avatar error", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setLoading(true);

      let uploadedAvatarUrl: string | null = null;

      if (avatarUri) {
        try {
          // Đọc file local thành base64
          const base64 = await FileSystem.readAsStringAsync(avatarUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Chuyển base64 -> ArrayBuffer để Supabase nhận đúng dữ liệu (React Native không có Blob)
          const binary = global.atob ? global.atob(base64) : Buffer.from(base64, "base64").toString("binary");
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          const fileExt = "jpg";
          const filePath = `players/${Date.now()}.${fileExt}`;

          const { data: storageData, error: storageError } = await supabase.storage
            .from("player-avatars")
            .upload(filePath, bytes.buffer, {
              contentType: "image/jpeg",
            });

          if (storageError) {
            console.error("upload avatar error", storageError);
          } else if (storageData?.path) {
            const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
            if (supabaseUrl) {
              uploadedAvatarUrl = `${supabaseUrl}/storage/v1/object/public/player-avatars/${storageData.path}`;
            }
          }
        } catch (err) {
          console.error("upload avatar exception", err);
        }
      }

      const player = await createPlayer({
        full_name: fullName.trim(),
        is_member: isMember,
        avatar_url: uploadedAvatarUrl,
      });

      const trimmedElo = initialElo.trim();
      const rating = Number(trimmedElo || "0");
      if (!Number.isNaN(rating) && rating > 0) {
        const { error } = await supabase.rpc("set_initial_rating", {
          p_player_id: player.id,
          p_rating: rating,
        });
        if (error) {
          console.error("set_initial_rating error", error);
        }
      }

      // Invalidate queries để refresh list players
      queryClient.invalidateQueries({ queryKey: ["players-with-stats"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      navigation.goBack();
    } catch (err) {
      console.error("Failed to create player", err);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.headerRow}>
        <MaterialIcons
          name="arrow-back"
          size={24}
          color={colors.textMainLight}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Create Player Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar placeholder */}
        <View style={styles.avatarSection}>
          <Pressable style={styles.avatarWrapper} onPress={handlePickAvatar}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons
                  name="person"
                  size={40}
                  color={colors.textSecondary}
                />
              )}
            </View>
            <View style={styles.avatarCamera}>
              <MaterialIcons
                name="photo-camera"
                size={16}
                color="#ffffff"
              />
            </View>
          </Pressable>
          <Text style={styles.avatarTitle}>Upload Photo</Text>
          <Text style={styles.avatarSubtitle}>PNG or JPG up to 5MB</Text>
        </View>

        {/* Personal information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Initial ELO</Text>
            <TextInput
              style={styles.input}
              placeholder="1200"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={initialElo}
              onChangeText={setInitialElo}
            />
          </View>
        </View>

        {/* Active / Member toggle */}
        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusTitle}>Active Member</Text>
            <Text style={styles.statusSubtitle}>
              Available for tournament invitations
            </Text>
          </View>
          <Switch
            value={isMember}
            onValueChange={setIsMember}
            trackColor={{ false: "#e5e7eb", true: colors.primary + "66" }}
            thumbColor={isMember ? colors.primary : "#ffffff"}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Create Player Profile"
          onPress={handleSubmit}
          loading={loading}
          disabled={!canSubmit}
        />
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#ffffff",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 48,
  },
  avatarCamera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  avatarTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  avatarSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMainLight,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: colors.textMainLight,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  statusSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surfaceLight,
  },
});

