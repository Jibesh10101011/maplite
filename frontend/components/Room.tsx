import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import React, { FC, useState } from "react";
import { Icons } from "@/constants/icons";
import { router } from "expo-router";
import { Entypo } from "@expo/vector-icons";

interface RoomProps {
  roomId: string;
  onDelete?: (roomId: string) => void;
}

const Room: FC<RoomProps> = ({ roomId, onDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      router.push(`/room/${roomId}`);
      setTimeout(() => setIsLoading(false), 600);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Navigation Error", "Failed to navigate to this room.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Room", `Delete room "${roomId}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          await onDelete?.(roomId);
          setMenuVisible(false);
          setIsLoading(false);
        },
      },
    ]);
  };

  return (
    <View className="p-4 m-1 rounded-xl relative">
      {/* 3-dot menu */}
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Entypo name="dots-three-vertical" size={18} color="#bbb" />
      </TouchableOpacity>

      {/* Room content */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        className={`rounded-xl flex justify-center items-center ${
          isLoading ? "opacity-50" : ""
        }`}
        disabled={isLoading}
      >
        <Image
          source={Icons.mapIcon}
          resizeMode="contain"
          tintColor="#FFA001"
          className="w-20 h-20 rounded-lg mb-2"
        />
        <Text className="text-white font-psemibold text-lg text-center">
          {isLoading ? "Loading..." : roomId}
        </Text>
        <Text className="text-gray-400 font-pregular text-sm mt-1">
          Tap to enter
        </Text>
      </TouchableOpacity>

      {/* Popup menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.menuBox}>
            <TouchableOpacity onPress={handleDelete} style={styles.menuItem}>
              <Text style={styles.menuText}>Delete Room</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default Room;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 20,
  },
  menuBox: {
    backgroundColor: "#2C2C2C",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuText: {
    color: "#ff6666",
    fontSize: 16,
    fontWeight: "600",
  },
});
