import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { images } from "../../constants/Images";
import FormFeild from "@/components/FormFeild";
import CustomButton from "@/components/CustomButton";


import { router } from "expo-router";
import { getProtectedData, handleCreateRoom, handleGenerateRoomId, handleSignIn, handleValidateRoomAndJoin } from "@/lib/apiBackend";
import Dialog from "@/components/Dialog";


const Create = () => {
  

  const [isJoining, setIsJoining] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [roomId,setRoomId] = useState<string>("");
  const [isCreating,setIsCreating] = useState({room:false,generating:false});
  

  const handleJoinRoom = async() => {
    try {
      setIsJoining(true);
      const success = await handleValidateRoomAndJoin(roomId);
      setIsJoining(false);
      if(success) 
        return router.push(`/room/${roomId}`);
      else 
        return router.push(`/(tabs)/create`);
    } catch(error) {
      setIsJoining(false);
      Alert.alert("Invalid Room ID");
      return router.push("/(tabs)/create");
    }
  };

  

  const generateRoomId = async() => {
    try {
      const roomId = await handleGenerateRoomId();
      setRoomId(roomId);
    } catch(error) {
      setRoomId("Error Occured");
    }
  }

  const createRoom = async()=>{
    try {
      setIsCreating({...isCreating,room:true});
      const success = await handleCreateRoom(roomId);
      console.log("Success = ",success);
      setIsCreating({...isCreating,room:false});
      if(success) {
        return router.push(`/room/${roomId}`);
      } else {
        Alert.alert("This Room ID already used by someone","Create a different Room ID");
        return router.push('/(tabs)/create');
      }
    } catch(error) {
      setIsCreating({...isCreating,room:false});
      Alert.alert("Something Went Wrong!");
      return router.push('/(tabs)/create');
    } 
  }

  useEffect(()=>{
    const fetchUser = async () => {
      try {
        const userData = await getProtectedData();
        console.log("User Data = ",userData);
      } catch (error) {
        router.replace("/(auth)/sign-in"); // Redirect on failure
      }
    };
    fetchUser();
  },[]);

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
            isLoading={isJoining}
          />
          <CustomButton
            title="Create Room"
            handlePress={() => setShowDialog(true)}
            containerStyles="mt-7"
            isLoading={false}
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
                  onPress: () => createRoom(),
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
