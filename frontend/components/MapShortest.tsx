import { FC, useRef, useState, useEffect } from "react";
import { View, Animated, TouchableOpacity, Text } from "react-native";
import MapView, { LongPressEvent, MapPressEvent, Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import * as polyline from "@mapbox/polyline";
import { getPathCoordinate } from "@/lib/apiBackend";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapShortestProps {
    roomId: string;
    userId: string;
}

const DESTINATION: Coordinate = {
  latitude: 26.7271,
  longitude: 88.3953,
};



const MapShortest: FC<MapShortestProps> = ({roomId, userId}) => {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [destination, setDestination] = useState<Coordinate| null>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<Coordinate | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

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

        // fetch route for initial location
        if(destination)
            fetchRoute({ latitude, longitude }, destination);

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
        const coordinates = await getPathCoordinate(roomId, userId, source, destination);
        const coords = coordinates.map((coord: [number, number]) => {
          const [lng, lat] = coord;
          return {
            latitude: lat,
            longitude: lng,
          };
        });
        setRouteCoords(coords);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };


  const handleMapPress = (event: LongPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log({latitude, longitude});
    setSelectedCoordinate({ latitude, longitude });
  }

  const confirmDestination = () => {
    if (selectedCoordinate && location) {
        setDestination(selectedCoordinate);
        fetchRoute(location, selectedCoordinate);
        setSelectedCoordinate(null);
    }
  }

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

      {selectedCoordinate && (
        <Marker
          coordinate={selectedCoordinate}
          title="Selected"
          pinColor="orange"
        />
      )}

      {destination && (
        <Marker
          coordinate={destination}
          title="Destination"
          pinColor="green"
        />
      )}

      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeWidth={4}
          strokeColor="#1E90FF"
        />
      )}
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
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
          Mark as Destination
        </Text>
      </TouchableOpacity>
    )}
  </Animated.View>
</View>

  );
};

export default MapShortest;
