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

const Room = () => {
  
  const { roomId } = useLocalSearchParams();
  console.log("Room ID = ",roomId);

  return (
    <View style={styles.container}>
        { roomId && typeof(roomId) === "string" && <RoomTab roomId={roomId} /> }
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
