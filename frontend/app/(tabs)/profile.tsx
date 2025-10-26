import {
  FlatList,
  Text,
  View,
  useWindowDimensions,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import Room from "@/components/Room";
import { deleteRoom, getAllRooms, getProtectedData } from "@/lib/apiBackend";
import { Link, router } from "expo-router";
import SearchInput from "@/components/SearchInput";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const Profile = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchRooms, setSearchedRooms] = useState<string[]>(rooms);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const [roomId, setRoomId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const isFocused = useIsFocused();

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const itemWidth = 160;
  const numColumns = Math.max(1, Math.floor(width / itemWidth));
  const itemSpacing = 12;
  const actualItemWidth = (width - (numColumns + 1) * itemSpacing) / numColumns;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSearchRoom = (e: string) => {
    if (e === "") return setSearchedRooms(rooms);
    const filtered = rooms.filter((r) =>
      r.toLowerCase().includes(e.toLowerCase())
    );
    setSearchedRooms(filtered);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await getRoomData();
    setRefreshing(false);
  }, [userId]);

  const getRoomData = async () => {
    try {
      if (!userId) return;
      setIsLoading(true);
      const allRooms = await getAllRooms();
      setIsLoading(false);
      setSearchedRooms(allRooms);
      setRooms(allRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getProtectedData();
        setUserId(userData._id);
      } catch (error) {
        router.replace("/(auth)/sign-in");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (isFocused && userId) getRoomData();
  }, [isFocused, userId]);

  const handleDeleteRoom = async (roomId: string) => {
    const isDeleted = await deleteRoom(roomId)
    if (isDeleted) {
      setRooms(rooms.filter(room => room != roomId));
      setSearchedRooms(prev => prev.filter(room => room !== roomId));
    }
  }

  const EmptyState = () => (
    <Animated.View
      className="flex-1 justify-center items-center px-10"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View className="w-20 h-20 rounded-full bg-white/10 justify-center items-center mb-5">
        <Text className="text-4xl">🏠</Text>
      </View>
      <Text className="text-2xl font-bold text-white mb-2 text-center">
        No Rooms Yet
      </Text>
      <Text className="text-base text-slate-400 text-center mb-8 leading-6">
        Create your first room to start collaborating with others
      </Text>
      <Link href="/(tabs)/create" asChild>
        <Pressable className="bg-[#FFA001] px-6 py-4 rounded-xl shadow-lg shadow-[#FFA001]/50">
          <Text className="text-white text-base font-semibold">
            Create Your First Room
          </Text>
        </Pressable>
      </Link>
    </Animated.View>
  );

  const RoomCard = ({ item, onDelete }: { item: string, onDelete: (roomId: string) => void }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => console.log("RoomCard pressed:", item)}
      style={{ width: actualItemWidth }}
      className="m-1 rounded-2xl shadow-md overflow-hidden"
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
          className="rounded-2xl overflow-hidden"
        >
          <View className="absolute inset-0 bg-black/10" />
          <Room roomId={item} onDelete={onDelete} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#161622] pb-24">
      <LinearGradient
        colors={["#161622", "#1a1a2e", "#16213e"]}
        // style={{ ...StyleSheet.absoluteFillObject }}
      />

      {/* Background Elements */}
      <View className="absolute inset-0 overflow-hidden">
        <Animated.View
          className="absolute top-[-100px] right-[-80px] w-[300px] h-[300px] rounded-full bg-[#FF6B00]"
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.6],
            }),
          }}
        />
        <Animated.View
          className="absolute bottom-[-120px] left-[-100px] w-[250px] h-[250px] rounded-full bg-[#8B5CF6]"
          style={{
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4],
            }),
          }}
        />
      </View>

      {/* Header */}
      <BlurView intensity={20} tint="dark" className="pt-16 pb-5 px-5 border-b border-white/10">
        <Animated.View
          className="flex-row justify-between items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="flex-1">
            <Text className="text-3xl font-bold text-white mb-1">My Rooms</Text>
            <Text className="text-sm text-slate-400 font-medium">
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} available
            </Text>
          </View>
          <View className="flex-1 ml-4">
            <SearchInput
              roomId={roomId}
              setRoomId={setRoomId}
              handleSearchRoom={handleSearchRoom}
            />
          </View>
        </Animated.View>
      </BlurView>

      {/* Content */}
      <View className="flex-1 px-2 pt-3">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text className="text-slate-400 text-base mt-3 font-medium">
                Loading your rooms...
              </Text>
            </Animated.View>
          </View>
        ) : searchRooms.length ? (
          <FlatList
            data={searchRooms}
            renderItem={({ item }) => <RoomCard item={item} onDelete={handleDeleteRoom} />}
            key={numColumns}
            keyExtractor={(item, index) => index.toString()}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 100,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFA001"
                colors={["#FFA001"]}
              />
            }
            ListHeaderComponent={
              <Text className="text-slate-400 text-sm mb-4 text-center font-medium">
                {searchRooms.length} room
                {searchRooms.length !== 1 ? "s" : ""} found
              </Text>
            }
          />
        ) : (
          <EmptyState />
        )}
      </View>
    </View>
  );
};

export default Profile;
