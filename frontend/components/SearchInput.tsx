import { useState } from "react";
import { router, usePathname } from "expo-router";
import { View, TouchableOpacity, Image, TextInput, Alert } from "react-native";

import { Icons } from "../constants/icons";

const SearchInput = ({ }) => {
  const pathname = usePathname();
//   const [query, setQuery] = useState(initialQuery || "");

  return (
    <View className="flex flex-row items-center space-x-4 w-60 h-16 px-4 bg-black-100 rounded-2xl border-2 border-black-200 focus:border-secondary">
      <TextInput
        className="text-base mt-0.5 text-white flex-1 font-pregular"
        value={""}
        placeholder="Search a room"
        placeholderTextColor="#CDCDE0"
        onChangeText={()=>{}}
      />

      <TouchableOpacity
        onPress={() => {
        //   if (query === "")
        //     return Alert.alert(
        //       "Missing Query",
        //       "Please input something to search results across database"
        //     );

        //   if (pathname.startsWith("/search")) router.setParams({ query });
        //   else router.push(`/room/${query}`);
        }}
      >
        <Image source={Icons.search} className="w-5 h-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;