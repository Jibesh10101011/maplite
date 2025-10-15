import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Animated,
  RefreshControl,
  Image,
  TouchableOpacity,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import Room from "@/components/Room";
import { getAllRooms, getProtectedData } from "@/lib/apiBackend";
import { Link, router } from "expo-router";
import SearchInput from "@/components/SearchInput";
import { useIsFocused } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const Profile = () => {
  const [rooms, setRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchRooms, setSearchedRooms] = useState<string[]>(rooms);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { width } = useWindowDimensions();
  const [roomId, setRoomId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const isFocused = useIsFocused();

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  // Responsive grid calculation
  const itemWidth = 160;
  const numColumns = Math.max(1, Math.floor(width / itemWidth));
  const itemSpacing = 12;
  const actualItemWidth = (width - (numColumns + 1) * itemSpacing) / numColumns;

  useEffect(() => {
    // Entrance animations
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

  function handleSearchRoom(e: string) {
    let testRooms: string[] = [];

    if (e === "") {
      setSearchedRooms(rooms);
      return;
    } else {
      rooms.forEach((ele) => {
        if (ele.toLowerCase().includes(e.toLowerCase())) testRooms.push(ele);
      });
      setSearchedRooms(testRooms);
    }
  }

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
    if (isFocused && userId) {
      getRoomData();
    }
  }, [isFocused, userId]);

  const EmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>🏠</Text>
      </View>
      <Text style={styles.emptyTitle}>No Rooms Yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first room to start collaborating with others
      </Text>
      <Link href="/(tabs)/create" asChild>
        <Pressable style={styles.createRoomButton}>
          <Text style={styles.createRoomButtonText}>
            Create Your First Room
          </Text>
        </Pressable>
      </Link>
    </Animated.View>
  );

  const RoomCard = ({ item }: { item: string }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={() => console.log("RoomCard pressed:", item)}
    style={[
      styles.roomCard,
      {
        width: actualItemWidth,
      },
    ]}
  >
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <LinearGradient
        colors={["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]}
        style={styles.roomGradient}
      >
        <View style={styles.roomOverlay} />
        <Room roomId={item} />
      </LinearGradient>
    </Animated.View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#161622", "#1a1a2e", "#16213e"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Animated Background Elements */}
      <View style={styles.backgroundElements}>
        <Animated.View
          style={[
            styles.floatingCircle,
            styles.circle1,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.6],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingCircle,
            styles.circle2,
            {
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 0.4],
              }),
            },
          ]}
        />
      </View>

      {/* Header Section */}
      <BlurView intensity={20} tint="dark" style={styles.header}>
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>My Rooms</Text>
            <Text style={styles.subtitle}>
              {rooms.length} room{rooms.length !== 1 ? "s" : ""} available
            </Text>
          </View>
          <View style={styles.searchContainer}>
            <SearchInput
              roomId={roomId}
              setRoomId={setRoomId}
              handleSearchRoom={handleSearchRoom}
            />
          </View>
        </Animated.View>
      </BlurView>

      {/* Content Area */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Animated.View
              style={[styles.loadingSpinner, { opacity: fadeAnim }]}
            >
              <Text style={styles.loadingText}>Loading your rooms...</Text>
            </Animated.View>
          </View>
        ) : searchRooms.length ? (
          <FlatList
            data={searchRooms}
            renderItem={({ item }) => <RoomCard item={item} />}
            key={numColumns}
            keyExtractor={(item, index) => index.toString()}
            numColumns={numColumns}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFA001"
                colors={["#FFA001"]}
              />
            }
            ListHeaderComponent={
              searchRooms.length > 0 ? (
                <Text style={styles.resultsText}>
                  {searchRooms.length} room{searchRooms.length !== 1 ? "s" : ""}{" "}
                  found
                </Text>
              ) : null
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161622",
  },
  backgroundElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  floatingCircle: {
    position: "absolute",
    borderRadius: 500,
  },
  circle1: {
    top: -100,
    right: -80,
    width: 300,
    height: 300,
    backgroundColor: "#FF6B00",
  },
  circle2: {
    bottom: -120,
    left: -100,
    width: 250,
    height: 250,
    backgroundColor: "#8B5CF6",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  searchContainer: {
    flex: 1,
    marginLeft: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  roomCard: {
    margin: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  roomGradient: {
    borderRadius: 16,
    overflow: "hidden",
  },
  roomOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: {
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  createRoomButton: {
    backgroundColor: "#FFA001",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#FFA001",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  createRoomButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsText: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "500",
  },
});
