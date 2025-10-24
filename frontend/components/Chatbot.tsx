import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import * as Location from "expo-location";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const BACKEND_URL = "http://192.168.0.101:8001/chat"; // your backend

export default function Chatbot() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required for localized chat.");
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLoading(false);

        setMessages([
          {
            _id: 1,
            text: "👋 Hi there! I'm your **local assistant**. Ask me anything about your area!",
            createdAt: new Date(),
            user: {
              _id: 2,
              name: "AI Assistant",
              avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
            },
          },
        ]);
      } catch (err) {
        console.error("Location error:", err);
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      setMessages((previous) => GiftedChat.append(previous, newMessages));
      const userMessage = newMessages[0]?.text;
      if (!userMessage || !location) return;

      setIsTyping(true);

      try {
        const response = await axios.post(BACKEND_URL, {
          message: userMessage,
          location,
        });

        const aiReply = response.data.reply || "Sorry, I couldn’t process that.";

        const botMessage: IMessage = {
          _id: Math.random().toString(),
          text: aiReply,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "AI Assistant",
            avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
          },
        };

        setMessages((previous) => GiftedChat.append(previous, [botMessage]));
      } catch (err) {
        console.log("AI error:", err);
        const botError: IMessage = {
          _id: Math.random().toString(),
          text: "⚠️ Unable to get response. Please try again.",
          createdAt: new Date(),
          user: { _id: 2, name: "AI Assistant" },
        };
        setMessages((previous) => GiftedChat.append(previous, [botError]));
      } finally {
        setIsTyping(false);
      }
    },
    [location]
  );

  const renderCustomText = (text: string) => {
    const parts = text.split(/(\/\*{3}.*?\*{3}\/|[@#*_]+)/g);
    return (
      <Text className="flex-wrap text-white">
        {parts.map((part, index) => {
          if (/^\/\*{3}.*\*{3}\/$/.test(part)) {
            return (
              <Text key={index} className="text-pink-400 font-bold">
                {part.replace(/\/\*{3}|\*{3}\//g, "").trim()}
              </Text>
            );
          } else if (/^[@#]/.test(part)) {
            return (
              <TouchableOpacity key={index} onPress={() => Alert.alert("Symbol tapped", part)}>
                <Text className="text-cyan-300 font-semibold">{part}</Text>
              </TouchableOpacity>
            );
          } else if (/\*/.test(part)) {
            return <Text key={index} className="font-bold text-white">{part.replace(/\*/g, "")}</Text>;
          }
          return <Text key={index} className="text-white">{part}</Text>;
        })}
      </Text>
    );
  };

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#2563EB", // Tailwind blue-600
          borderRadius: 16,
          marginVertical: 2,
          padding: 8,
        },
        left: {
          backgroundColor: "#334155", // slate-700
          borderRadius: 16,
          marginVertical: 2,
          padding: 8,
        },
      }}
      textStyle={{
        right: { color: "#fff", fontSize: 16 },
        left: { color: "#fff", fontSize: 16 },
      }}
      renderMessageText={(textProps) => renderCustomText(textProps.currentMessage.text)}
    />
  );

  if (loading) {
    return (
      <LinearGradient colors={["#1e3a8a", "#0f172a"]} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text className="text-white mt-4 text-lg font-semibold">Loading Assistant...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1e3a8a", "#0f172a"]} className="flex-1">
      <GiftedChat
        messages={messages}
        onSend={(msgs) => onSend(msgs)}
        user={{
          _id: 1,
          name: "You",
          avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png",
        }}
        renderBubble={renderBubble}
        showUserAvatar
        alwaysShowSend
        placeholder="Type your message..."
        renderAvatarOnTop
        isTyping={isTyping}
      />

      {isTyping && (
        <View className="flex-row items-center px-4 py-2 bg-slate-800/60 border-t border-slate-700">
          <ActivityIndicator size="small" color="#38BDF8" />
          <Text className="ml-2 text-white">AI Assistant is typing...</Text>
        </View>
      )}
    </LinearGradient>
  );
}
