import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Alert,
  Button,
} from "react-native";
import React, { useState } from "react";
import { images } from "../../constants/Images";
import FormFeild from "@/components/FormFeild";
import CustomButton from "@/components/CustomButton";


import { Link, router } from "expo-router";
import { handleGenerateRoomId, handleSignIn } from "@/lib/apiBackend";
import Dialog from "@/components/Dialog";


const Create = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [roomId,setRoomId] = useState<string>("");
  const [isCreating,setIsCreating] = useState({room:false,generating:false});


  const submit = async () => {
    try {
      setIsSubmitting(true);
      if (!form.email.length && !form.password.length) {
        Alert.alert("Fill all the Input Field correctly");
        return;
      }
      await handleSignIn(form.email, form.password);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert("Error during SignIn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinRoom = () => {
    console.log("Room ID = ",roomId);
    router.push(`/room/${roomId}`);
  };

  const handleCreateRoom = () => {
      router.push(`/room/${roomId}`);
  };

  const generateRoomId = async() => {
    try {
      const roomId = await handleGenerateRoomId();
      setRoomId(roomId);
    } catch(error) {
      setRoomId("Error Occured");
    }
  }


  return (
    <SafeAreaView>
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6 ">
          <View className="flex items-center justify-center">
            <Image
              source={images.maplite}
              resizeMode="contain"
              className="w-[150px] h-[150px] mt-10"
            />
          </View>
          <FormFeild
            title="Room ID"
            value={roomId}
            setValue={(e) => setRoomId(e)}
            otherStyles="mt-7"
            placeholder="Enter your room ID"
            keyboardType="email-address"
          />
          <CustomButton
            title="Join Room"
            handlePress={handleJoinRoom}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <CustomButton
            title="Create Room"
            handlePress={() => setShowDialog(true)}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Dialog
              visible={showDialog}
              title="Confirmation"
              message="Are you sure you want to delete this item?"
              onDismiss={() => setShowDialog(false)}
              buttons={[
                {
                  text: "Cancel",
                  onPress: () => console.log("Room Creating canceled"),
                },
                {
                  text: "Create",
                  onPress: () => handleCreateRoom(),
                },
              ]}

              generateRoomId={generateRoomId}
              roomId={roomId}
              setRoomId={setRoomId}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Create;

const styles = StyleSheet.create({});
