import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import FormFeild from "./FormFeild";

interface DialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: Array<{
    text: string;
    onPress?: () => void;
  }>;
  dismissOnTouchOutside?: boolean;
  onDismiss: () => void;
}

const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  buttons,
  dismissOnTouchOutside = true,
  onDismiss,
}) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => dismissOnTouchOutside && onDismiss()}
      >
        <View style={styles.container}>
          <View style={styles.dialog}>
            {/* {message && <Text style={styles.message}>{message}</Text>}         */}
            <Text style={styles.message}>Create Your Own</Text>
            <FormFeild
              title=""
              value={form.password}
              setValue={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-1" // Updated to use StyleSheet-like object
              // Added for password field
              placeholder="Room ID"
            />
            <View className="flex-row justify-end">
                
              <Text className="text-gray-50 mt-2">@generate</Text>
            </View>
            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {buttons?.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.button}
                  onPress={() => {
                    button.onPress?.();
                    onDismiss();
                  }}
                >
                  <Text style={styles.buttonText}>{button.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
  },
  dialog: {
    backgroundColor: "black",
    borderRadius: 8,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20, // Added margin for spacing
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 4,
    minWidth: 80,
    alignItems: "center",
    backgroundColor: "#007AFF", // Added background color
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "white", // Changed text color for better contrast
  },
});

export default Dialog;
