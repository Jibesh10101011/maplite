import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React,{useEffect, useState} from 'react';
import Room from '@/components/Room';
import { getProtectedData } from '@/lib/apiBackend';
import { router } from 'expo-router';
import SearchInput from '@/components/SearchInput';

const Profile = () => {
  const rooms = ["134e5", "34dejd", "er3423", "12wkww", "23ekdkd","34dejd", "er3423","23ekdkd","34dejd", "er3423", "12wkww","34dejd", "er3423", "12wkww","34dejd", "er3423", "12wkww","12wkww"];
  const [ searchRooms,setSearchedRooms ] = useState<string[]>(rooms);
  const { width } = useWindowDimensions();
  const [ roomId,setRoomId ] = useState<string>("");

  // Define minimum width per item
  const itemWidth = 120; 
  const numColumns = Math.max(1, Math.floor(width / itemWidth));

  function handleSearchRoom(e:string) {
    let testRooms:string[] = [];

    console.log("Triggered");
    console.log("Room ID = ",e);

    if(e === "") {
      setSearchedRooms(rooms);
      return;
    } else {
      rooms.forEach((ele)=>{
        if(ele.includes(e)) testRooms.push(ele);
      });
      console.log("Searched Rooms = ",searchRooms);
      setSearchedRooms(testRooms)
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
    <View style={styles.container}>
      <View className='flex flex-row justify-between items-center border-b border-gray-400 my-1'>
        <Text className='text-gray-100 text-3xl m-2 p-2 rounded-lg'>Rooms</Text>
        <SearchInput
          roomId={roomId}
          setRoomId={setRoomId}
          handleSearchRoom={handleSearchRoom}
        />
      </View>
      <FlatList
        data={searchRooms}
        renderItem={({ item }) => (
          <View style={[styles.roomContainer, { width: width / numColumns - 10 }]}>
            <Room roomId={item} />
          </View>
        )}
        key={numColumns} // Forces re-render when numColumns changes
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:50
  },
  listContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomContainer: {
    margin: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#161622",
  },
});
