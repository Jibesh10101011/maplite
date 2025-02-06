import {
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RoomTab from "@/components/RoomTab";
import { useEffect, useState } from "react";
import { getProtectedData } from "@/lib/apiBackend";

const Room = () => {
  
  const { roomId } = useLocalSearchParams();
  const [user,setUser] = useState("");
  console.log("Room ID = ",roomId);

  useEffect(()=>{
    async function getData() {
      try {
        const userData = await getProtectedData();
        console.log(userData);
        const { id,name,email } = userData.user;
        setUser(name);
      } catch(error) {
        Alert.alert("Invalid User","Need to Sign In");
        router.push("/(auth)/sign-in");
      }
    }

    getData();

  },[])

  return (
    <View style={styles.container}>
        { roomId && typeof(roomId) === "string" && <RoomTab sender={user} roomId={roomId} /> }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    color: "#fff",
  },
 
});

export default Room;
