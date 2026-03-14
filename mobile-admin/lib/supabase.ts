import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Supabase env vars EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY chưa được set. Admin mobile sẽ không gọi được API."
  );
}

// Tạm thời KHÔNG dùng AsyncStorage để tránh lỗi native module null.
// Khi cần persist session thật, có thể cấu hình lại sau với Expo config phù hợp.
export const supabase = createClient(
  supabaseUrl ?? "http://localhost",
  supabaseAnonKey ?? "public-anon-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);


