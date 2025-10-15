import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import * as Location from "expo-location";
import axios from "axios";

const BACKEND_URL = "http://192.168.0.101:8001/chat"; // your backend

export default function Chatbot() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

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
            text: "Hi there! 👋 I'm your **local assistant**. Ask me anything about your area!",
            createdAt: new Date(),
            user: { _id: 2, name: "AI Assistant", avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" },
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
          user: { _id: 2, name: "AI Assistant", avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" },
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
      }
    },
    [location]
  );

  const renderCustomText = (text: string) => {
    const parts = text.split(/(\/\*{3}.*?\*{3}\/|[@#*_]+)/g);
    return (
      <Text style={{ flexWrap: "wrap" }}>
        {parts.map((part, index) => {
          if (/^\/\*{3}.*\*{3}\/$/.test(part)) {
            // Highlight /*** text ***/
            return (
              <Text key={index} style={styles.highlightText}>
                {part.replace(/\/\*{3}|\*{3}\//g, "").trim()}
              </Text>
            );
          } else if (/^[@#]/.test(part)) {
            // Make @ or # interactive
            return (
              <TouchableOpacity key={index} onPress={() => Alert.alert("Symbol tapped", part)}>
                <Text style={styles.symbolText}>{part}</Text>
              </TouchableOpacity>
            );
          } else if (/\*/.test(part)) {
            // Bold *text*
            return <Text key={index} style={styles.boldText}>{part.replace(/\*/g, "")}</Text>;
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.userBubble,
        left: styles.botBubble,
      }}
      textStyle={{
        right: styles.userText,
        left: styles.botText,
      }}
      renderMessageText={(textProps) => renderCustomText(textProps.currentMessage.text)}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={(msgs) => onSend(msgs)}
      user={{ _id: 1, name: "You", avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" }}
      renderBubble={renderBubble}
      showUserAvatar
      alwaysShowSend
      placeholder="Type your message..."
      renderAvatarOnTop
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  userBubble: {
    backgroundColor: "#007AFF",
    padding: 8,
    borderRadius: 12,
    marginVertical: 2,
  },
  botBubble: {
    backgroundColor: "#EAEAEA",
    padding: 8,
    borderRadius: 12,
    marginVertical: 2,
  },
  userText: { color: "#fff", fontSize: 16 },
  botText: { color: "#333", fontSize: 16 },
  highlightText: {
    color: "#E91E63",
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold",
  },
  symbolText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
