import { FC, useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { Icons } from "../constants/icons";

interface SearchInputProps {
    roomId:string;
    setRoomId:(e:string)=>void;
    handleSearchRoom:(e:string)=>void;
};

const SearchInput:FC<SearchInputProps> = ({ roomId,setRoomId,handleSearchRoom }) => {
  const pathname = usePathname();
//   const [query, setQuery] = useState(initialQuery || "");

  return (
    <View className="flex flex-row items-center space-x-4 w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={roomId}
        placeholder="Search a room"
        placeholderTextColor="#CDCDE0"
        onChangeText={(e)=>{
            handleSearchRoom(e);
            setRoomId(e)
        }}
      />

      <TouchableOpacity
        onPress={()=>handleSearchRoom(roomId)}
      >
        <Image source={Icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;