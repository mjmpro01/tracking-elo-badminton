import { ReactNode } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderLight,
    marginBottom: 12,
  },
});

