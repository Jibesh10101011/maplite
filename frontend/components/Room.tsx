import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import React, { FC, useState } from "react";
import { Icons } from "@/constants/icons";
import { router } from "expo-router";

interface RoomProps {
  roomId: string;
}

const Room: FC<RoomProps> = ({ roomId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      console.log("Navigating to room:", roomId);
      
      // Test if the route exists
      router.push(`/room/${roomId}`);
      
      // If navigation fails, this will execute
      setTimeout(() => {
        if (!isLoading) return;
        setIsLoading(false);
        Alert.alert("Navigation Error", `Could not navigate to room: ${roomId}`);
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      console.error("Navigation error:", error);
      Alert.alert("Error", `Failed to navigate: ${error}`);
    }
  };

  return (
    <View className="bg-white/10 rounded-2xl p-4 m-2 border border-white/20">
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
          {isLoading ? "Loading..." : `${roomId}`}
        </Text>
        <Text className="text-gray-400 font-pregular text-sm mt-1">
          Tap to enter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Room;