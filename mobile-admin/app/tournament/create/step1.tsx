import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { colors } from "../../../theme/colors";
import { Button } from "../../../components/ui/Button";
import { supabase } from "../../../lib/supabase";

export default function CreateTournamentStep1Screen() {
  const navigation = useNavigation<any>();
  const [tournamentName, setTournamentName] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedK, setSelectedK] = useState<number>(60);
  const [nameError, setNameError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const monthLabel = currentMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array(daysInMonth)
      .fill(0)
      .map((_, i) => i + 1),
  ];

  const handlePickCover = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo access to upload a tournament cover.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.9,
      });

      if (result.canceled || !result.assets || !result.assets.length) {
        return;
      }

      const uri = result.assets[0].uri;
      setCoverUri(uri);
      setCoverUploading(true);

      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const binary = global.atob
          ? global.atob(base64)
          : Buffer.from(base64, "base64").toString("binary");
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        const fileExt = "jpg";
        const filePath = `tournaments/${Date.now()}.${fileExt}`;

        // Tận dụng bucket player-avatars hiện tại (thư mục con tournaments/)
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from("player-avatars")
          .upload(filePath, bytes.buffer, {
            contentType: "image/jpeg",
          });

        if (storageError) {
          console.error("upload tournament cover error", storageError);
          Alert.alert(
            "Upload error",
            "Không thể upload ảnh tournament. Bạn vẫn có thể tiếp tục tạo giải.",
          );
          setCoverUrl(null);
        } else if (storageData?.path) {
          const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
          if (supabaseUrl) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/player-avatars/${storageData.path}`;
            setCoverUrl(publicUrl);
          }
        }
      } catch (err) {
        console.error("upload tournament cover exception", err);
        Alert.alert(
          "Upload error",
          "Có lỗi khi upload ảnh. Bạn vẫn có thể tiếp tục tạo giải.",
        );
        setCoverUrl(null);
      } finally {
        setCoverUploading(false);
      }
    } catch (err) {
      console.error("pick tournament cover error", err);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const handleNextStep = () => {
    let valid = true;

    if (!tournamentName.trim()) {
      setNameError("Tournament name is required");
      valid = false;
    } else {
      setNameError(null);
    }

    if (!selectedDay) {
      setDateError("Please select a date");
      valid = false;
    } else {
      setDateError(null);
    }

    if (!valid || selectedDay == null) return;

    const startDate = new Date(year, month, selectedDay);

    navigation.navigate("CreateTournamentStep2", {
      kFactor: selectedK,
      tournamentName: tournamentName.trim(),
      startDate: startDate.toISOString(),
      coverImageUrl: coverUrl,
    });
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
        <Text style={styles.headerTitle}>Create Tournament</Text>
        <MaterialIcons
          name="more-vert"
          size={22}
          color={colors.textMuted}
        />
      </View>

      {/* Stepper */}
      <View style={styles.stepperRow}>
        <View style={[styles.stepBar, styles.stepBarActive]} />
        <View style={styles.stepBar} />
        <View style={styles.stepBar} />
        <View style={styles.stepBar} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.title}>Tournament Details</Text>
        </View>

        {/* Tournament Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Tournament Name</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="e.g. Summer Open 2023"
              placeholderTextColor={colors.textMuted}
              value={tournamentName}
              onChangeText={(text) => {
                setTournamentName(text);
                if (nameError && text.trim()) {
                  setNameError(null);
                }
              }}
            />
            <MaterialIcons
              name="edit"
              size={18}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
          </View>
          {nameError && <Text style={styles.errorText}>{nameError}</Text>}
        </View>

        {/* Tournament Cover */}
        <View style={styles.section}>
          <Text style={styles.label}>Tournament Cover</Text>
          <Pressable style={styles.coverCard} onPress={handlePickCover}>
            {coverUri ? (
              <Image
                source={{ uri: coverUri }}
                style={styles.coverImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.coverPlaceholder}>
                <MaterialIcons
                  name="photo"
                  size={32}
                  color={colors.textSecondary}
                />
                <Text style={styles.coverPlaceholderText}>
                  Tap to upload tournament banner
                </Text>
              </View>
            )}
          </Pressable>
          {coverUploading && (
            <Text style={styles.coverUploadingText}>Đang upload ảnh...</Text>
          )}
        </View>

        {/* Date - calendar selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.card}>
            <View style={styles.calendarHeaderRow}>
              <Pressable
                onPress={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                  )
                }
                hitSlop={8}
              >
                <MaterialIcons
                  name="chevron-left"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
              <Text style={styles.calendarMonthLabel}>{monthLabel}</Text>
              <Pressable
                onPress={() =>
                  setCurrentMonth(
                    (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                  )
                }
                hitSlop={8}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
            </View>

            <View style={styles.weekdaysRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((d, index) => (
                <Text key={`weekday-${index}`} style={styles.weekdayLabel}>
                  {d}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {days.map((day, index) =>
                day == null ? (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                ) : (
                  <Pressable
                    key={`day-${index}`}
                    style={styles.dayCell}
                    onPress={() => setSelectedDay(day)}
                  >
                    <View
                      style={[
                        styles.dayButton,
                        selectedDay === day && styles.dayButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selectedDay === day && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                ),
              )}
            </View>

            <Text style={styles.cardHint}>
              Selected date:{" "}
              {selectedDay
                ? `${selectedDay}/${month + 1}/${year}`
                : "Chưa chọn ngày."}
            </Text>
            {dateError && <Text style={styles.errorText}>{dateError}</Text>}
          </View>
        </View>

        {/* K-Factor Selection */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>K-Factor Sensitivity</Text>
            <Text style={styles.infoLink}>What is this?</Text>
          </View>
          <View style={styles.kGrid}>
            {[40, 60, 80].map((k, index) => (
              <View key={k} style={styles.kCardWrapper}>
                <Pressable
                  onPress={() => setSelectedK(k)}
                  style={[
                    styles.kCard,
                    selectedK === k && styles.kCardActive,
                  ]}
                >
                  <Text style={styles.kCaption}>
                    {index === 0
                      ? "Friendly"
                      : index === 1
                      ? "Monthly"
                      : "Major"}
                  </Text>
                  <Text style={styles.kValue}>{k}</Text>
                </Pressable>
              </View>
            ))}
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
            title="Next Step"
            onPress={handleNextStep}
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: colors.textMainLight,
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
  },
  leadingIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    marginTop: -10,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardText: {
    fontSize: 15,
    color: colors.textMainLight,
    fontWeight: "500",
  },
  cardHint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#DC2626",
  },
  calendarHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calendarMonthLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMainLight,
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    marginBottom: 4,
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: 13,
    color: colors.textMainLight,
  },
  dayTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
  coverCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
    backgroundColor: colors.surfaceLight,
  },
  coverImage: {
    width: "100%",
    height: 160,
  },
  coverPlaceholder: {
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  coverPlaceholderText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  coverUploadingText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  kGrid: {
    flexDirection: "row",
    gap: 12,
  },
  kCardWrapper: {
    flex: 1,
  },
  kCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  kCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "0D",
  },
  kCaption: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  kValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textMainLight,
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

