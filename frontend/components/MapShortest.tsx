import { FC, useRef, useState, useEffect } from "react";
import { View, Animated, TouchableOpacity, Text } from "react-native";
import MapView, {
  LongPressEvent,
  MapPressEvent,
  Marker,
  Polyline,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import * as polyline from "@mapbox/polyline";
import { getPathCoordinate } from "@/lib/apiBackend";
import io, { Socket } from "socket.io-client";

const BACKEND_URL = "http://192.168.0.101:8000";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapShortestProps {
  roomId: string;
  userId: string;
}

interface CoordinateSocketData {
  roomId: string;
  userId: string;
  routeCoordinates: [number, number][];
}

interface UserCoordinate {
  userId: string;
  latitude: number;
  longitude: number;
}

const DESTINATION: Coordinate = {
  latitude: 26.7271,
  longitude: 88.3953,
};


const colors = [
  "#FF5733",
  "#33B5E5",
  "#9C27B0",
  "#4CAF50",
  "#FFC107",
  "#E91E63",
  "#00BCD4",
  "#8BC34A",
  "#FF9800",
  "#3F51B5"
];


const MapShortest: FC<MapShortestProps> = ({ roomId, userId }) => {
  console.log("Entered Room: ", roomId);

  const mapRef = useRef<MapView>(null);
  const socketRef = useRef<Socket | null>(null);
  const locationRef = useRef<Coordinate | null>(null);

  const [location, setLocation] = useState<Coordinate | null>(null);
  const [destination, setDestination] = useState<Coordinate | null>(null);
  const [liveUsers, setLiveUsers] =  useState<Record<string, Coordinate>>(
    {}
  );
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinate | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);

  const [userRoutes, setUserRoutes] = useState<Record<string, Coordinate[]>>(
    {}
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Socket

  useEffect(() => {
    socketRef.current = io(`${BACKEND_URL}/map`, { transports: ["websocket"] });
    const socket = socketRef.current;
    socket.emit("subscribe", `${roomId}`);

    socket.on(
      "shortest-path-coordinates-history",
      (data: CoordinateSocketData[]) => {

        console.log("History = ", data);

        if (!Array.isArray(data) || data.length === 0) return;
        setUserRoutes((prevRoutes) => {
          const updatedRoutes: Record<string, Coordinate[]> = { ...prevRoutes };

          data.forEach((ele) => {
            if (!ele?.userId || !Array.isArray(ele.routeCoordinates)) return;

            const coords = ele.routeCoordinates.map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng,
            }));

            updatedRoutes[ele.userId] = coords;
          });

          return updatedRoutes;
        });
      }
    );

    socket.on("shortest-path-coordinates", (data: CoordinateSocketData) => {
      const { userId, routeCoordinates } = data;
      const coords = routeCoordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
      setUserRoutes((prev) => ({
        ...prev,
        [userId]: coords,
      }));
    });

    socket.on("current_location", (data: UserCoordinate) => {
      const { userId, latitude, longitude } = data;
      setLiveUsers((userMap) => {
        const updatedUserMap: Record<string, Coordinate> = { ...userMap };
        updatedUserMap[userId] = { latitude, longitude };
        return updatedUserMap;
      })
    });



    return () => {
      socket.emit("unsubscribe", `coordinate:${roomId}`);
      socket.off("shortest-path-coordinates");
      socket.off("shortest-path-coordinates-history");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const initLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          alert("Please allow location access");
          return;
        }

        const initialLocation = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = initialLocation.coords;
        setLocation({ latitude, longitude });
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 10,
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            const roundedLat = parseFloat(latitude.toFixed(6));
            const roundedLng = parseFloat(longitude.toFixed(6));

            setLocation({ latitude: roundedLat, longitude: roundedLng });
            setMapRegion((prev) => ({
              ...prev,
              latitude,
              longitude,
            }));

            mapRef.current?.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );

            if (socketRef.current) {
              const socket = socketRef.current;
              socket.emit("current_user_location",
                { 
                  latitude: roundedLat, 
                  longitude: roundedLng,
                  userId,
                  roomId
                }
              )
            }

          }
        );
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    initLocationTracking();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  const fetchRoute = async (source: Coordinate, destination: Coordinate) => {
    try {
      console.log("Fetched");
      const coordinates = await getPathCoordinate(
        roomId,
        userId,
        source,
        destination
      );
      const coords = coordinates.map((coord: [number, number]) => {
        const [lng, lat] = coord;
        return {
          latitude: lat,
          longitude: lng,
        };
      });
      setRouteCoords(coords);
      setUserRoutes((prev) => ({ ...prev, [userId]: coords }));
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  const handleMapPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log({ latitude, longitude });
    setSelectedCoordinate({ latitude, longitude });
  };

  const confirmDestination = () => {
    if (selectedCoordinate && location) {
      setDestination(selectedCoordinate);
      fetchRoute(location, selectedCoordinate);
      setSelectedCoordinate(null);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Animated.View
        style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          margin: 8,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          toolbarEnabled={false}
          onLongPress={handleMapPress}
        >
          {location && (
            <Marker
              coordinate={location}
              title="You"
              description={`Lat: ${location.latitude}, Long: ${location.longitude}`}
              pinColor="red"
            />
          )}

          {destination && (
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="green"
            />
          )}

          {selectedCoordinate && (
            <Marker
              coordinate={selectedCoordinate}
              title="Selected"
              pinColor="orange"
            />
          )}

          {/* Render All Users’ Routes */}
          {Object.entries(userRoutes).map(([id, coords]) =>
            coords.length > 0 ? (
              <Polyline
                key={id}
                coordinates={coords}
                strokeWidth={4}
                strokeColor={id === userId ? "#1E90FF" : "#32CD32"} // Current user blue, others green
              />
            ) : null
          )}

          {/* Live Users */}
          {Object.entries(liveUsers).map(([user, coordinate]) => <>
            {user != userId ?
            <Marker
              key={`live-${user}`}
              coordinate={coordinate}
              title={`${user}`}
              pinColor={colors[Math.floor(Math.random() * 10)]}
            />
            : <></> }
          </>)}

          {/* Start & Destination Markers for Each User */}
          {Object.entries(userRoutes).map(([id, coords]) => {
            if (coords.length < 2) return null;
            const end = coords[coords.length - 1];

            return (
              <>
                <Marker
                  key={`end-${id}`}
                  coordinate={end}
                  title={`${
                    id === userId ? "Your Destination" : `${id}'s Destination`
                  }`}
                  pinColor={id === userId ? "green" : "#ADFF2F"} // light green for others
                />
              </>
            );
          })}
        </MapView>

        {/* Confirm Button */}
        {selectedCoordinate && (
          <TouchableOpacity
            onPress={confirmDestination}
            style={{
              position: "absolute",
              bottom: 40,
              left: "25%",
              right: "25%",
              backgroundColor: "#1E40AF",
              paddingVertical: 12,
              borderRadius: 24,
              zIndex: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Mark as Destination
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

export default MapShortest;
