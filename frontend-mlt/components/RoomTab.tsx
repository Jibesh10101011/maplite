import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  Modal
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import io from "socket.io-client";
import { FC, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
const BACKEND_URL = "http://192.168.0.101:3000";
import axios from "axios";

interface RoomTabProps {
  roomId: string;
  sender: string;
}

const socket = io(BACKEND_URL);

const RoomTab: FC<RoomTabProps> = ({ roomId, sender }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputHeight, setInputHeight] = useState(56); // Initial height
  const flatListRef = useRef<FlatList>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    socket.emit("subscribe", roomId);

    socket.on("previous_messages", (messages) => {
      setMessages((prevMessages) => [...prevMessages, ...messages]);
    });

    socket.on("chat_message", (newMessage) => {
      console.log("New Messages = ", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, []);

  useEffect(() => {
    // Scroll to the end whenever messages change
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("send_message", { roomId, sender, message, type: "string" });
      setMessage("");
      setInputHeight(56); // Reset height after sending
    }
  };

  const pickFile = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        console.log("Picked File = ", file);
        const fileName = file.uri.split("/").pop();
        const fileType = file.mimeType || "image/jpeg"; // Adjust based on file type

        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: fileName,
          type: fileType,
        } as any);

        const response = await axios.post(`${BACKEND_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data?.fileUrl) {
          console.log("File uploaded to S3:", response.data.fileUrl);
          socket.emit("send_message", {
            roomId,
            sender,
            message: response.data.fileUrl,
            type: "url",
          });
        } else {
          console.error("File upload failed, fileUrl not received.");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick a file.");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setIsRecording(true);

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isDoneRecording) {
          setIsRecording(false);
          sendVoiceMessage(recording.getURI());
        }
      });
    } catch (error) {
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const sendVoiceMessage = async (uri: string | null) => {
    if (uri) {
      socket.emit("send_voice_message", { roomId, sender, voiceMessage: uri });
    }
  };

  const handleContentSizeChange = (event: any) => {
    const { height } = event.nativeEvent.contentSize;
    // Set a minimum and maximum height for the input
    const newHeight = Math.max(56, Math.min(height, 150)); // Min: 56, Max: 150
    setInputHeight(newHeight);
  };

  function playAudio(voiceMessage: any): void {
    throw new Error("Function not implemented.");
  }

  return (
    <View className="flex-1 p-3 bg-white">
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item, index }) => (
          <View
            className={`max-w-[80%] p-3 my-1 rounded-lg ${
              item.sender === sender
                ? "bg-green-100 self-end rounded-tr-none"
                : "bg-gray-100 self-start rounded-tl-none"
            }`}
          >
            {item.message && (
              <View className="flex flex-col justify-between">
                <Text className="text-blue-800">~{item.sender}</Text>
                {item.type === "string" && (
                  <Text
                    className={`text-base ${
                      index % 2 === 0 ? "text-gray-800" : "text-gray-800"
                    }`}
                  >
                    {item.message}
                  </Text>
                )}
              </View>
            )}
            {/* {item.type && item.type === "url" && (
              <>
                {item.message.endsWith(".jpg") ||
                item.message.endsWith(".jpeg") ||
                item.message.endsWith(".png") ||
                item.message.endsWith(".gif") ? (
                  <Image
                    source={{ uri: item.message }}
                    className="w-40 h-40 mt-2 rounded-lg"
                    resizeMode="contain"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(item.message)}
                    style={{
                      marginTop: 10,
                      padding: 10,
                      backgroundColor: "#007bff",
                      borderRadius: 5,
                    }}
                  >
                    <Text style={{ color: "white" }}>📂 Open File</Text>
                  </TouchableOpacity>
                )}
              </>
            )} */}

          <>
                {/* Thumbnail Preview */}
                {item.type === "url" && item.message.endsWith(".jpg") || item.message.endsWith(".jpeg") || item.message.endsWith(".png") && (
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image
                      source={{ uri: item.message }}
                      className="w-40 h-40 mt-2 rounded-lg"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}

                {/* Full-Screen Image Modal */}
                <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" }}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={{ position: "absolute", top: 40, right: 20 }}>
                      <Text style={{ color: "white", fontSize: 18 }}>✖</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: item.message }} style={{ width: "90%", height: "80%", resizeMode: "contain" }} />
                  </View>
                </Modal>
              </>

            {item.voiceMessage && (
              <TouchableOpacity onPress={() => playAudio(item.voiceMessage)}>
                <Text className="text-blue-500 mt-2">Play Voice Message</Text>
              </TouchableOpacity>
            )}
            <Text
              className={`text-xs mt-1 ${
                index % 2 === 0
                  ? "text-gray-500 self-start"
                  : "text-gray-500 self-end"
              }`}
            >
              12:40
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View className="flex-row items-center p-2 border-t border-gray-200 bg-white">
        <TouchableOpacity onPress={pickFile} className="p-2 mr-2">
          <Text className="text-blue-500">📎</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={startRecording} className="p-2 mr-2">
          <Text className="text-red-500">{isRecording ? "🎤⏺️" : "🎤"}</Text>
        </TouchableOpacity>
        <TextInput
          className="flex-1 h-20 px-4 mr-2 bg-gray-100 rounded-sm text-base text-gray-800"
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline={true}
          onContentSizeChange={handleContentSizeChange}
          style={{
            height: inputHeight,
            maxHeight: 150,
            textAlignVertical: "top",
          }}
        />
        <TouchableOpacity
          onPress={sendMessage}
          className="px-5 py-2 bg-green-500 rounded-full justify-center items-center"
        >
          <Text className="text-white text-base font-bold">Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoomTab;
