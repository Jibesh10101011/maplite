import {
  ScrollView,
  FlatList,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import io from "socket.io-client";
import { BACKEND_URL } from "@env";
import { FC, useEffect, useState } from "react";
interface RoomTabProps {
    roomId:string;
}

const socket = io(BACKEND_URL);
const RoomTab:FC<RoomTabProps> = ({ roomId }) => {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        socket.emit("subscribe", roomId);
        socket.on("chat_message", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
        return () => {
            socket.off("chat_message");
        };
    }, []);
    const sendMessage = () => {
        if (message.trim()) {
            socket.emit("send_message", { channel: roomId, message });
            setMessage("");
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>{item}</Text>
                </View>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
            <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
            />
            <Button title="Send" onPress={sendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        color: "#fff",
    },
    messageContainer: {
        padding: 10,
        marginBottom: 5,
        color: "#fff",
        borderRadius: 5,
        backgroundColor: "#f1f1f1",
    },
    messageText: {
        fontSize: 16,
    },
    input: {
        color: "#fff",
        borderColor: "#ccc",
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
    },
});
export default RoomTab;
