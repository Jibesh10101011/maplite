import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { GiftedChat, InputToolbar, Composer, IMessage } from "react-native-gifted-chat";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = "http://192.168.0.101:8000"; 

export default function RoomTab({ roomId, sender }: { roomId: string; sender: string }) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const user = { 
    _id: 1, 
    name: sender, 
    avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" 
  };
  const receiver = { 
    _id: 2, 
    name: "Other User",
    avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png"
  };

  useEffect(() => {
    socketRef.current = io(`${BACKEND_URL}/chat`, { transports: ["websocket"] });
    const socket = socketRef.current;

    socket.emit("subscribe", roomId);

    socket.on("previous_messages", (msgs: any[]) => {
      const giftedMessages: IMessage[] = msgs.map((msg) => ({
        _id: msg._id || Math.random().toString(),
        text: msg.message,
        createdAt: new Date(msg.timestamp),
        user: {
          _id: msg.sender === sender ? 1 : 2,
          name: msg.sender,
          avatar: msg.sender === sender ? user.avatar : receiver.avatar,
        },
      }));
      setMessages(GiftedChat.append([], giftedMessages.reverse()));
      setIsLoading(false);
    });

    socket.on("chat_message", (newMessage: any) => {
      const giftedMessage: IMessage = {
        _id: newMessage._id || Math.random().toString(),
        text: newMessage.message,
        createdAt: new Date(),
        user: {
          _id: newMessage.sender === sender ? 1 : 2,
          name: newMessage.sender,
          avatar: newMessage.sender === sender ? user.avatar : receiver.avatar,
        },
      };

      setMessages((previous) => {
        const exists = previous.some(
          (m) => m.text === giftedMessage.text && m.user.name === giftedMessage.user.name
        );
        if (!exists) return GiftedChat.append(previous, [giftedMessage]);
        return previous;
      });
    });

    return () => {
      socket.emit("unsubscribe", roomId);
      socket.off("previous_messages");
      socket.off("chat_message");
      socket.disconnect();
    };
  }, [roomId, sender]);

  const onSend = useCallback((newMessages: IMessage[] = []) => {
    const messageToSend = newMessages[0];
    setMessages((previous) => GiftedChat.append(previous, newMessages));

    if (messageToSend?.text) {
      socketRef.current?.emit("send_message", {
        roomId,
        sender,
        message: messageToSend.text,
        type: "string",
      });
    }
  }, [roomId, sender]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Connecting to room...</Text>
      </View>
    );
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={user}
      renderAvatarOnTop
      showUserAvatar
      alwaysShowSend
      placeholder="Type your message..."
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbarContainer}
          primaryStyle={{ alignItems: "center" }}
        />
      )}
      renderComposer={(props) => (
        <Composer
          {...props}
          textInputStyle={styles.textInput}
          placeholderTextColor="#999"
        />
      )}
      isKeyboardInternallyHandled={true}
      minInputToolbarHeight={50}
      bottomOffset={0}
      messagesContainerStyle={styles.messagesContainer}
    />
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    color: "#666",
    marginTop: 10,
  },
  messagesContainer: {
    // backgroundColor: "#121214",
  
  },
  inputToolbarContainer: {
    backgroundColor: "transparent",
    // borderTopWidth: 1,
    // borderTopColor: "",
    // paddingVertical: 6,
    // paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 2,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: "transparent",
    // borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#fff",
  },
});
