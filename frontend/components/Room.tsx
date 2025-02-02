import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { FC, useState } from "react";
import { Icons } from "@/constants/icons";
import { router } from "expo-router";

interface RoomProps {
  roomId: string;
}

const Room: FC<RoomProps> = ({ roomId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePress = () => {
    router.push(`/room/${roomId}`);
  };

  return (
    <View className="">
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
          tintColor="red"
          className="w-20 h-20 border border-red-500 rounded-lg"
        />
        <Text className={`text-white font-psemibold text-lg`}>
          {isLoading ? "loading..." : `${roomId}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Room;

const styles = StyleSheet.create({});
