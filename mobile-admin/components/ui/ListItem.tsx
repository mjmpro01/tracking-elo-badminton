import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

type ListItemVariant = "chevron" | "checkbox" | "action" | "plain";

type Props = {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  variant?: ListItemVariant;
  style?: ViewStyle;
};

export function ListItem({
  title,
  subtitle,
  left,
  right,
  onPress,
  variant = "chevron",
  style,
}: Props) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {left ? <View style={styles.left}>{left}</View> : null}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.right}>
        {right}
        {variant === "chevron" && (
          <Text style={styles.chevron}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    marginBottom: 8,
  },
  left: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  right: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textMainLight,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    marginLeft: 4,
  },
});

