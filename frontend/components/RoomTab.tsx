// @/components/RoomTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  Platform,
  // We don't need KeyboardAvoidingView here, GiftedChat handles it
} from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import io from "socket.io-client";

// NOTE: Use the socket backend URL for the standard chat room
const BACKEND_URL = "http://192.168.0.101:8000"; 
const socket = io(BACKEND_URL);

interface RoomTabProps {
  roomId: string;
  sender: string;
}

export default function RoomTab({ roomId, sender }: RoomTabProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Define the user object for GiftedChat
  const user = { 
    _id: 1, 
    name: sender, 
    // Example avatar, you can replace with a dynamic image
    avatar: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png" 
  };
  
  // Define the receiver (other room members) user object
  const receiver = { 
    _id: 2, 
    name: 'Other User', // Name will be overridden by the message sender, but required here
    avatar: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
  };

  useEffect(() => {
    // 1. Socket Setup
    socket.emit("subscribe", roomId);
    
    // 2. Fetch previous messages
    socket.on("previous_messages", (msgs: any[]) => {
      // Map server messages to IMessage format
      const giftedMessages: IMessage[] = msgs.map(msg => ({
        _id: Math.random().toString(),
        text: msg.message,
        createdAt: new Date(msg.timestamp), // Assuming timestamp is available
        user: { 
          _id: msg.sender === sender ? 1 : 2, // 1 for current user, 2 for others
          name: msg.sender,
        },
      }));
      setMessages((previous) => GiftedChat.append(previous, giftedMessages.reverse()));
      setIsLoading(false);
    });

    // 3. Handle incoming live messages
    socket.on("chat_message", (newMessage: any) => {
      const giftedMessage: IMessage = {
        _id: Math.random().toString(),
        text: newMessage.message,
        createdAt: new Date(),
        user: { 
          _id: newMessage.sender === sender ? 1 : 2,
          name: newMessage.sender,
          avatar: newMessage.sender === sender ? user.avatar : receiver.avatar,
        },
      };
      setMessages((previous) => GiftedChat.append(previous, [giftedMessage]));

    });

    return () => { 
      socket.off("chat_message"); 
      socket.off("previous_messages"); 
    };
  }, [roomId, sender]);

  // Handle sending a new message
  const onSend = useCallback((newMessages: IMessage[] = []) => {
    const messageToSend = newMessages[0];

    // Update local state immediately
    setMessages((previous) => GiftedChat.append(previous, newMessages));

    // Emit message to server
    if (messageToSend && messageToSend.text) {
      socket.emit("send_message", { 
        roomId, 
        sender, 
        message: messageToSend.text, 
        type: "string" // assuming simple text for now
      });
    }
  }, [roomId, sender]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ color: '#666', marginTop: 10 }}>Connecting to room...</Text>
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
      isKeyboardInternallyHandled={true} 
      minInputToolbarHeight={44}
      bottomOffset={0} // Ensure it doesn't leave an unnecessary gap
      messagesContainerStyle={styles.messagesContainer}
    />
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#F0F4F8' // Match background for a smooth transition
  },
  messagesContainer: {
    // Add some padding if needed, but flex:1 in the parent (Room.tsx) handles the size
  },
  textInput: {
    // Custom style to match the rest of your app's aesthetic
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 12,
  }
});