import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
  } from "react-native";
  import React, { useEffect, useState, useRef, FC } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import MapView, { Marker, Polyline } from "react-native-maps";
  import * as Location from "expo-location";
  import axios from "axios"; // For REST API communication
  const BACKEND_URL = "http://192.168.0.101:3000";
  
  interface MapRoomProps {
    roomId:string;
    username : string;
  };
  
  interface OthersLocationType {
    username: string;
    latitude: number;
    longitude: number;
  }
  interface UserLocations {
    [key: string]: { latitude: number; longitude: number }[]; // Each key (username) will have an array of coordinates
  }
  
  // const BACKEND_URL = "http://192.168.0.101:3000/api"; // Replace with your backend URL
  const { width, height } = Dimensions.get("window");
  
  const MapRoom:FC<MapRoomProps> = ( { roomId,username } ) => {
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [kafkaMessage, setKafkaMessage] = useState<OthersLocationType[]>([]); // Kafka messages as an array of user locations
    const mapRef = useRef<any>(null);
    const [path, setPath] = useState<any[]>([]);
    const [usersPath, setUsersPath] = useState<UserLocations>({});
    const [location, setLocation] = useState<any>(null);
    
    console.log("Room Id = ",roomId);
    console.log("User name = ",username);
    // console.log("Bakend URL = ",BACKEND_URL);
  
    const [mapRegion, setMapRegion] = useState({
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });
  
    // Function to handle zoom in
    const handleZoomIn = () => {
      setMapRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta * 0.8, // Zoom in by decreasing delta
        longitudeDelta: prevRegion.longitudeDelta * 0.8, // Zoom in by decreasing delta
      }));
    };
  
    // Function to handle zoom out
    const handleZoomOut = () => {
      setMapRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta * 1.8, // Zoom out by increasing delta
        longitudeDelta: prevRegion.longitudeDelta * 1.8, // Zoom out by increasing delta
      }));
    };
  
    const zoomToMarker = (markerLocation: {
      latitude: number;
      longitude: number;
    }) => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            ...markerLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000 // Animation duration
        );
      }
    };
  
    useEffect(() => {
      // Request location permissions
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied.");
          return;
        }
  
        // Watch user location and send it to the backend
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          async (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation({ latitude, longitude });
            setMapRegion({ ...mapRegion, latitude, longitude });
            setPath((prevPath) => [...prevPath, { latitude, longitude }]);
            // Send the location data to the Kafka backend
            try {
              const response = await axios.post(`${BACKEND_URL}/api/send-location`, {
                roomId,
                username,
                latitude,
                longitude,
              });
              // console.log("Response = ", response.data);
            } catch (err) {
              console.error("Error sending location to Kafka:", err);
            }
  
            // Update the map region
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
      })();
  
      const fetchKafkaMessages = async () => {
        try {

          console.log("Users Path = ",usersPath);


            if(!roomId) return;

          const response = await axios.get(`${BACKEND_URL}/api/get-kafka-messages/${roomId}`);
          console.log("Response Data = ", response.data);
              if (response.data.success) {
                console.log("YES Success");
                // Create a new object to hold the updated paths
                const updatedUsersPath: UserLocations = { ...usersPath };
                // response.data.message.forEach((user: OthersLocationType) => {
                //   if (!updatedUsersPath.hasOwnProperty(user.username)) {
                //     updatedUsersPath[user.username] = [];
                //   }
                //   updatedUsersPath[user.username].push({
                //     latitude: user.latitude,
                //     longitude: user.longitude,
                //   });
                // }


                // response.data.messageCache.forEach((user: OthersLocationType) => {
                //     if (!updatedUsersPath.hasOwnProperty(user.username)) {
                //       updatedUsersPath[user.username] = [];
                //     }
                //     updatedUsersPath[user.username].push({
                //       latitude: user.latitude,
                //       longitude: user.longitude,
                //     });
                // });


                Object.keys(response.data.messageCache).forEach((username) => { 

                  if (!updatedUsersPath.hasOwnProperty(username)) {
                    updatedUsersPath[username] = [];
                  }
                  
                  response.data.messageCache[username].forEach((location:any) => {
                    updatedUsersPath[username].push({
                      latitude: location.latitude,
                      longitude: location.longitude,
                    });
                  });
                });
                

      
            // Use setUsersPath to update the state correctly
            setUsersPath((prevUsersPath) => {
              let mergedPaths: UserLocations = { ...prevUsersPath };

              console.log("Merged Paths = ",mergedPaths);

              for (const username in updatedUsersPath) {
                if (mergedPaths.hasOwnProperty(username)) {
                  mergedPaths[username] = [...mergedPaths[username], ...updatedUsersPath[username]];
                } else {
                  mergedPaths[username] = [...updatedUsersPath[username]];
                }
              }
              return mergedPaths;
            });


            // console.log("Users Path = ",usersPath);
// 
      
            setKafkaMessage(response.data.message);
          }
        } catch (err) {
          console.error("Error fetching Kafka messages:", err);
        }
      };
      
      const interval = setInterval(fetchKafkaMessages, 3000); 
      return () => clearInterval(interval);
    }, []);
  
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          <Text style={styles.headerText}>This is Test Map</Text>
          <View className="m-2">
            <MapView ref={mapRef} style={styles.map} initialRegion={{
              latitude: 37.78825,
              longitude: -122.4324,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
              {path.length > 1 && (
                <Polyline
                  coordinates={path}
                  strokeColor="#FF0000" // Path color
                  strokeWidth={5} // Path width
                />
  
              )}
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="Jibesh Roy"
                  description={`Latitude: ${location.latitude}, Longitude: ${location.longitude}`}
                  pinColor="red" // Different color for other users
                />
              )}
              {Array.isArray(kafkaMessage) &&
                kafkaMessage.map((user: OthersLocationType, index) => (
                  <View key={index+2929}>
                  <Marker
                    
                    coordinate={{
                      latitude: user.latitude,
                      longitude: user.longitude,
                    }}
                    title={user.username}
                    description={`Latitude: ${user.latitude}, Longitude: ${user.longitude}`}
                    pinColor="red" // Different color for other users
                  />
  
                  {usersPath && usersPath[user.username] && 
                    <Polyline
                      coordinates={usersPath[user.username]}
                      strokeColor="blue" // Path color
                      strokeWidth={5}
                    />
                  }
                  </View>
                ))}
            </MapView>
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                <Text style={styles.zoomText}>-</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Buttons for zooming */}
  
          {/* Display user details */}
          <View style={styles.infoContainer}>
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
            {Array.isArray(kafkaMessage) &&
              kafkaMessage.map((user: OthersLocationType, index) => (
                <Text style={styles.kafkaText} key={index}>
                  {`Username: ${user.username}, Latitude: ${user.latitude}, Longitude: ${user.longitude}`}
                </Text>
              ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default MapRoom;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    headerText: {
      fontSize: 18,
      textAlign: "center",
      marginVertical: 10,
      color: "black",
    },
    infoContainer: {
      padding: 10,
      alignItems: "center",
    },
    text: {
      fontSize: 16,
      color: "black",
      textAlign: "center",
    },
    errorText: {
      fontSize: 16,
      color: "red",
      textAlign: "center",
    },
    kafkaText: {
      fontSize: 16,
      color: "blue",
      textAlign: "center",
      marginTop: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 10,
    },
    button: {
      backgroundColor: "#007BFF",
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: "white",
      fontSize: 14,
    },
    zoomControls: {
      position: "absolute",
      bottom: height * 0.05, // Adjust based on screen height
      right: width * 0.05, // Adjust based on screen width
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },
    zoomButton: {
      backgroundColor: "#007AFF",
      borderRadius: 25,
      width: width * 0.1, // Dynamic width (10% of screen width)
      height: width * 0.1, // Dynamic height (10% of screen width)
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 10,
    },
    zoomText: {
      color: "white",
      fontSize: width * 0.08, // Adjust font size based on screen width
      fontWeight: "bold",
    },
    map: {
      width: "100%",
      height: height * 0.4, // Map height is 80% of screen height
    },
  });
  