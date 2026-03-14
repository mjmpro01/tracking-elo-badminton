import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" || variant === "ghost" ? colors.textMainLight : "#ffffff"}
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant !== "primary" && { color: colors.textMainLight },
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  disabled: {
    opacity: 0.6,
  },
});

const sizeStyles: Record<ButtonSize, ViewStyle> = {
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  md: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  lg: {
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
};

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  ghost: {
    backgroundColor: "transparent",
  },
};

