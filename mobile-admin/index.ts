// Bắt buộc import cho react-native-gesture-handler trước mọi thứ khác
import "react-native-gesture-handler";

// Khởi động app bằng React Navigation stack trong `App.tsx`.
// Điều này giữ nguyên layout/tab navigation hiện tại cho toàn bộ app.
import { registerRootComponent } from "expo";
import App from "./App";

registerRootComponent(App);

