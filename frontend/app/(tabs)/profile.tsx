import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React,{useEffect, useState} from 'react';
import Room from '@/components/Room';
import { getAllRooms, getProtectedData } from '@/lib/apiBackend';
import { Link, router } from 'expo-router';
import SearchInput from '@/components/SearchInput';
import { useIsFocused } from "@react-navigation/native";


const Profile = () => {
  const [ rooms,setRooms ] = useState<string[]>([]);
  const [ isLoading,setIsLoading ] = useState<boolean>(false);
  const [ searchRooms,setSearchedRooms ] = useState<string[]>(rooms);
  const { width } = useWindowDimensions();
  const [ roomId,setRoomId ] = useState<string>("");
  const [ userId,setUserId ] = useState<string>("");
  const isFocused = useIsFocused(); 
  

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
          setUserId(userData.user.id);
          console.log("User Data = ",userData.user.id);
        } catch (error) {
          router.replace("/(auth)/sign-in"); // Redirect on failure
        }
      };
      fetchUser()
    },[]);

    useEffect(() => {
      const getRoomData = async () => {
        try {
          if (!userId) return;
          setIsLoading(true);
          const allRooms = await getAllRooms(userId);
          setIsLoading(false);
          console.log("All Rooms  = ", allRooms);
          setSearchedRooms(allRooms);
          setRooms(allRooms);
        } catch (error) {
          router.push("/(tabs)");
        }
      };
  
      if (isFocused && userId) {
        getRoomData(); // Refetch data when screen is focused
      }
    }, [isFocused,userId]); // Runs whenever `isFocused` changes
  

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
      {isLoading ? <Text className='text-3xl text-white mt-20 mx-auto'>loading ... </Text> :
      
      searchRooms.length ? 
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
      /> : 
      <View> 
        <Text className='text-3xl text-white mt-20 mx-auto'>No Room Created !</Text> 
        <Link href="/(tabs)/create" className='text-blue-600 text-2xl underline mx-auto'>Create Room</Link>
        
      </View>
      }
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
