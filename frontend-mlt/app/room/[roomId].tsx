import {
  View,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import RoomTab from "@/components/RoomTab";
import { useEffect, useState } from "react";
import { getProtectedData } from "@/lib/apiBackend";
import MapRoom from "@/components/MapRoom";

const Room = () => {
  
  const { roomId }:{ roomId:string } = useLocalSearchParams();
  const [user,setUser] = useState("");
  console.log("Room ID = ",roomId);
  console.log("Type of ROOM ID = ",typeof(roomId));

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
        {roomId && typeof(roomId) === "string" && user && <MapRoom roomId={roomId} username={user} /> }
        { roomId && typeof(roomId) === "string" && <RoomTab sender={user} roomId={roomId} /> }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:"column",
    justifyContent:"space-between",
    padding: 10,
    color: "#fff",
  },
 
});

export default Room;
