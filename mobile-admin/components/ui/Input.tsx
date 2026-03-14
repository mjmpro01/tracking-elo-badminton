import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors } from "../../theme/colors";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: Props) {
  const hasError = Boolean(error);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          hasError && { borderColor: colors.error },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        {...rest}
      />
      {hasError ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMainLight,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: colors.surfaceLight,
    color: colors.textMainLight,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: colors.error,
  },
});

