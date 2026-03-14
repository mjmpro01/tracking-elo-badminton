import { View, Text, StyleSheet } from "react-native";

export default function MatchesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Matches</Text>
      <Text style={styles.subtitle}>
        Danh sách matches, filter (Today / All / By Tournament) và quick actions
        sẽ được implement sau.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f8",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    color: "#101622",
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
});

