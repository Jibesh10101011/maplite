import {
//   ScrollView,
//   FlatList,
  View,
//   Text,
//   TextInput,
//   Button,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import RoomTab from "@/components/RoomTab";
import { useEffect, useState } from "react";
import { getProtectedData } from "@/lib/apiBackend";

const Room = () => {
  
  const { roomId } = useLocalSearchParams();
  const [user,setUser] = useState("");
  console.log("Room ID = ",roomId);

  useEffect(()=>{
    async function getData() {
      const userData = await getProtectedData();
      console.log(userData);
      const { id,name,email } = userData.user;
      setUser(name);
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
