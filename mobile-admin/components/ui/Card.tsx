import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
});

