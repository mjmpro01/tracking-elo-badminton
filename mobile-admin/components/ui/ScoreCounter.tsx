import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function ScoreCounter({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
}: Props) {
  const handleChange = (delta: number) => {
    const next = value + delta;
    if (next < min || next > max) return;
    onChange(next);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, styles.buttonLeft]}
          onPress={() => handleChange(-1)}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, styles.buttonRight]}
          onPress={() => handleChange(1)}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMainLight,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonLeft: {
    marginRight: 8,
  },
  buttonRight: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textMainLight,
  },
  valueContainer: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    backgroundColor: colors.backgroundDark,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textMainDark,
  },
});

