import { Tabs, Redirect } from "expo-router";
import { useAuth } from "../../lib/hooks/useAuth";

export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="tournaments" options={{ title: "Tournaments" }} />
      <Tabs.Screen name="matches" options={{ title: "Matches" }} />
      <Tabs.Screen name="players" options={{ title: "Players" }} />
    </Tabs>
  );
}

