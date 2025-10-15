import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDistance } from "geolib";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const BACKEND_URL = "http://192.168.0.101:3000";
const STREAM_URL = "http://192.168.0.101:5000/api/v1/location";
const BACKEND_URL_V2 = "http://192.168.0.101:8000/api/v2";

interface MapRoomProps {
  roomId: string;
  username: string;
}

interface OthersLocationType {
  username: string;
  latitude: number;
  longitude: number;
}

interface UserLocations {
  [key: string]: { latitude: number; longitude: number }[];
}

const MapRoom: React.FC<MapRoomProps> = ({ roomId, username }) => {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [usersMap, setUsersMap] = useState<Map<string, Set<string>>>(new Map());
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const usersPath = useMemo(() => {
    const obj: UserLocations = {};
    usersMap.forEach((set, username) => {
      obj[username] = Array.from(set).map((s) => {
        const [latitude, longitude] = s.split(",").map(Number);
        return { latitude, longitude };
      });
    });
    return obj;
  }, [usersMap]);

  useEffect(() => {
    console.log("HAAAAA");

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    let locationSubscription: Location.LocationSubscription | undefined;
    let interval: ReturnType<typeof setInterval> | null;

    const initLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied.");
          setIsLoading(false);
          return;
        }

        const initialLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = initialLocation.coords;
        setLocation({ latitude, longitude });
        setMapRegion((prev) => ({ ...prev, latitude, longitude }));

        let prev: { latitude: number; longitude: number } | null = null;

        // Watch position
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // 1 second
            distanceInterval: 10, // trigger every 10 meters
          },
          async (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            const roundedLat = parseFloat(latitude.toFixed(6));
            const roundedLng = parseFloat(longitude.toFixed(6));

            if (prev) {
              const moved = getDistance(prev, {
                latitude: roundedLat,
                longitude: roundedLng,
              });
              if (moved < 3) return;
            }

            prev = { latitude: roundedLat, longitude: roundedLng };

            setLocation({ latitude, longitude });
            setMapRegion((prevRegion) => ({
              ...prevRegion,
              latitude,
              longitude,
            }));

            try {
              await axios.post(`${STREAM_URL}/send-location/`, {
                roomId,
                username,
                latitude: parseFloat(latitude.toFixed(6)),
                longitude: parseFloat(longitude.toFixed(6)),
              });
            } catch (err) {
              console.error("Error sending location to backend:", err);
            }

            // Animate map
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  latitude,
                  longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                1000
              );
            }
          }
        );

        setIsLoading(false);
      } catch (error) {
        console.error("Error getting location:", error);
        setIsLoading(false);
      }
    };

    const fetchKafkaMessages = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!roomId || !token) return;

        const response = await axios.get(
          `${BACKEND_URL_V2}/location/coordinates/${roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const locationData: OthersLocationType[] = response.data.data;

        setUsersMap((prevMap) => {
          const newMap = new Map(prevMap);

          locationData.forEach(({ username, latitude, longitude }) => {
            if (!newMap.has(username)) {
              newMap.set(username, new Set());
            }
            const userSet = newMap.get(username)!;
            userSet.add(`${latitude},${longitude}`);

            if (userSet.size > 10) {
              const arr = Array.from(userSet).slice(-10);
              newMap.set(username, new Set(arr));
            }
          });

          return newMap;
        });
      } catch (err) {
        console.error("Error fetching Kafka messages:", err);
      }
    };

    // Start both tasks
    initLocationTracking();
    fetchKafkaMessages();
    interval = setInterval(fetchKafkaMessages, 100000);

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      clearInterval(interval);
    };
  }, [roomId, username]);

  const handleZoomIn = () => {
    mapRef.current?.getCamera().then((camera: any) => {
      camera.zoom += 1;
      mapRef.current?.animateCamera(camera, { duration: 500 });
    });
  };

  const handleZoomOut = () => {
    mapRef.current?.getCamera().then((camera: any) => {
      camera.zoom -= 1;
      mapRef.current?.animateCamera(camera, { duration: 500 });
    });
  };

  const handleLocateMe = () => {
    if (location) {
      mapRef.current?.animateToRegion(
        {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const getRandomColor = (username: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F8B195",
      "#6C5B7B",
      "#355C7D",
    ];
    const index = username.length % colors.length;
    return colors[index];
  };

  const getActiveUsersCount = () => {
    return Object.keys(usersPath).length;
  };

  // Calculate dynamic height for users container
  const getUsersContainerHeight = () => {
    const userCount = getActiveUsersCount();
    if (userCount === 0) return 180;
    const baseHeight = 80;
    const userItemHeight = 72;
    const maxHeight = SCREEN_HEIGHT * 0.4;

    const calculatedHeight = baseHeight + userCount * userItemHeight;
    return Math.min(calculatedHeight, maxHeight);
  };

  // Live Users Detail Component
  const LiveUsersDetail = () => {
    const [expanded, setExpanded] = useState(false);

    if (getActiveUsersCount() === 0) {
      return null;
    }

    return (
      <Animated.View
        style={[
          styles.liveUsersDetail,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            height: expanded ? SCREEN_HEIGHT * 0.6 : 120,
          },
        ]}
      >
        <BlurView intensity={25} tint="dark" style={styles.liveUsersBlur}>
          <TouchableOpacity
            style={styles.liveUsersHeader}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
          >
            <View style={styles.liveUsersHeaderLeft}>
              <Ionicons
                name={expanded ? "chevron-down" : "chevron-up"}
                size={24}
                color="#FFA001"
              />
              <Text style={styles.liveUsersTitle}>Live Users Details</Text>
            </View>
            <View style={styles.liveUsersStats}>
              <Text style={styles.liveUsersCount}>{getActiveUsersCount()}</Text>
              <Text style={styles.liveUsersLabel}>Online</Text>
            </View>
          </TouchableOpacity>

          {expanded && (
            <ScrollView
              style={styles.liveUsersScrollView}
              showsVerticalScrollIndicator={false}
            >
              {Object.entries(usersPath).map(([key, path]) => {
                if (path.length === 0) return null;

                const lastCoord = path[path.length - 1];
                const userColor = getRandomColor(key);
                const distance = location
                  ? calculateDistance(
                      location.latitude,
                      location.longitude,
                      lastCoord.latitude,
                      lastCoord.longitude
                    )
                  : 0;

                return (
                  <View key={key} style={styles.liveUserItem}>
                    <View style={styles.liveUserLeft}>
                      <View
                        style={[
                          styles.liveUserAvatar,
                          { backgroundColor: userColor },
                        ]}
                      >
                        <Text style={styles.liveUserAvatarText}>
                          {key.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.liveUserInfo}>
                        <Text style={styles.liveUserName}>{key}</Text>
                        <Text style={styles.liveUserLocation}>
                          {lastCoord.latitude.toFixed(6)},{" "}
                          {lastCoord.longitude.toFixed(6)}
                        </Text>
                        <Text style={styles.liveUserDistance}>
                          {distance.toFixed(2)} km away
                        </Text>
                      </View>
                    </View>
                    <View style={styles.liveUserRight}>
                      <View style={styles.liveUserPathInfo}>
                        <Ionicons name="footsteps" size={16} color="#94a3b8" />
                        <Text style={styles.liveUserPathText}>
                          {path.length} points
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.liveUserStatus,
                          { backgroundColor: `${userColor}20` },
                        ]}
                      >
                        <View
                          style={[
                            styles.liveStatusDot,
                            { backgroundColor: userColor },
                          ]}
                        />
                        <Text style={styles.liveStatusText}>Live</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </BlurView>
      </Animated.View>
    );
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={["#161622", "#1a1a2e", "#16213e"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.loadingContent}>
          <View style={styles.loadingSpinner}>
            <Ionicons name="map" size={40} color="#FFA001" />
          </View>
          <Text style={styles.loadingText}>Loading Live Map...</Text>
        </View>
      </View>
    );
  }

  console.log("UsersPath = ", usersPath);

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        {/* Background Gradient */}
        <LinearGradient
          colors={["#161622", "#1a1a2e", "#16213e"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <BlurView intensity={25} tint="dark" style={styles.header}>
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
              <Text style={styles.roomTitle}>Live Map</Text>
              <Text style={styles.roomSubtitle}>Room: {roomId}</Text>
              <Text style={styles.userWelcome}>Welcome, {username}</Text>
            </View>

            <View style={styles.headerStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getActiveUsersCount()}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
            </View>
          </Animated.View>
        </BlurView>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Map Container */}
          <Animated.View
            style={[
              styles.mapContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={mapRegion}
              showsUserLocation={true}
              showsMyLocationButton={false}
              showsCompass={true}
              toolbarEnabled={false}
            >
              {/* Other users' paths and markers */}
              {Object.entries(usersPath).map(([key, path]) => {
                if (path.length === 0) return null;

                const lastCoord = path[path.length - 1];
                const userColor = getRandomColor(key);

                return (
                  <View key={`${key}-marker`}>
                    <Marker
                      coordinate={{
                        latitude: lastCoord.latitude,
                        longitude: lastCoord.longitude,
                      }}
                      title={key}
                      description={`Last updated position`}
                    >
                      <View
                        style={[
                          styles.customMarker,
                          { backgroundColor: userColor },
                        ]}
                      >
                        <Text style={styles.markerText}>
                          {key.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                    </Marker>

                    {path.length > 1 && (
                      <Polyline
                        coordinates={path}
                        strokeColor={userColor}
                        strokeWidth={4}
                      />
                    )}
                  </View>
                );
              })}
            </MapView>

            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleLocateMe}
              >
                <Ionicons name="locate" size={24} color="white" />
              </TouchableOpacity>

              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={handleZoomIn}
                >
                  <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={handleZoomOut}
                >
                  <Ionicons name="remove" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Live Users Detail Component */}
          <LiveUsersDetail />

          {/* Users Container - Dynamic Height */}
          <Animated.View
            style={[
              styles.usersContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
                height: getUsersContainerHeight(),
              },
            ]}
          >
            <BlurView intensity={20} tint="dark" style={styles.usersBlur}>
              <View style={styles.usersHeader}>
                <View style={styles.headerLeft}>
                  <Ionicons name="people" size={20} color="#FFA001" />
                  <Text style={styles.usersTitle}>Active Users</Text>
                </View>
                <View style={styles.usersCount}>
                  <Text style={styles.usersCountText}>
                    {getActiveUsersCount()}
                  </Text>
                </View>
              </View>

              <ScrollView
                style={styles.usersScrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.usersScrollContent}
              >
                {Object.entries(usersPath).map(([key, path]) => {
                  if (path.length === 0) return null;

                  const lastCoord = path[path.length - 1];
                  const userColor = getRandomColor(key);

                  return (
                    <View key={key} style={styles.userItem}>
                      <View style={styles.userLeft}>
                        <View
                          style={[
                            styles.userAvatar,
                            { backgroundColor: userColor },
                          ]}
                        >
                          <Text style={styles.userAvatarText}>
                            {key.substring(0, 2).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.userInfo}>
                          <Text style={styles.userName} numberOfLines={1}>
                            {key}
                          </Text>
                          <Text style={styles.userLocation} numberOfLines={1}>
                            {lastCoord.latitude.toFixed(4)},{" "}
                            {lastCoord.longitude.toFixed(4)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.userStatus}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: userColor },
                          ]}
                        />
                        <Text style={styles.statusText}>Live</Text>
                      </View>
                    </View>
                  );
                })}

                {getActiveUsersCount() === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={32} color="#94a3b8" />
                    <Text style={styles.emptyText}>
                      No active users in this room
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Users will appear here when they join
                    </Text>
                  </View>
                )}
              </ScrollView>
            </BlurView>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default MapRoom;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161622",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
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
  roomTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  roomSubtitle: {
    fontSize: 16,
    color: "#94a3b8",
    marginBottom: 4,
  },
  userWelcome: {
    fontSize: 14,
    color: "#FFA001",
    fontWeight: "500",
  },
  headerStats: {
    alignItems: "flex-end",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFA001",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  mapContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    minHeight: 300,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  zoomControls: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 25,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 160, 1, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  // Live Users Detail Styles
  liveUsersDetail: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  liveUsersBlur: {
    flex: 1,
    padding: 16,
  },
  liveUsersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  liveUsersHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveUsersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  liveUsersStats: {
    alignItems: "center",
  },
  liveUsersCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFA001",
  },
  liveUsersLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  liveUsersScrollView: {
    flex: 1,
    marginTop: 12,
  },
  liveUserItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  liveUserLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  liveUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  liveUserAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  liveUserInfo: {
    flex: 1,
  },
  liveUserName: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 2,
  },
  liveUserLocation: {
    color: "#94a3b8",
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 2,
  },
  liveUserDistance: {
    color: "#FFA001",
    fontSize: 11,
    fontWeight: "500",
  },
  liveUserRight: {
    alignItems: "flex-end",
  },
  liveUserPathInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  liveUserPathText: {
    color: "#94a3b8",
    fontSize: 11,
    marginLeft: 4,
  },
  liveUserStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  liveStatusText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "500",
  },
  // Existing Users Container Styles
  usersContainer: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 80,
  },
  usersBlur: {
    flex: 1,
    padding: 16,
  },
  usersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  usersTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  usersCount: {
    backgroundColor: "#FFA001",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  usersCountText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  usersScrollView: {
    flex: 1,
  },
  usersScrollContent: {
    flexGrow: 1,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  userLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 2,
  },
  userLocation: {
    color: "#94a3b8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  userStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubtext: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
  },
});
