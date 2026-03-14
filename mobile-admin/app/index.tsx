import { Redirect } from "expo-router";

// Entry route cho app: nếu không có path cụ thể (mobile-admin:///)
// thì điều hướng luôn sang màn login.
export default function IndexRoute() {
  return <Redirect href="/(auth)/login" />;
}

