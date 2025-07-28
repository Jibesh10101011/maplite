import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const TestMap = () => {
    const [location, setLocation] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const mapRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied.');
                return;
            }

            Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (newLocation) => {
                    const { latitude, longitude } = newLocation.coords;
                    console.log("New Location:", latitude, longitude); 
                    setLocation({ latitude, longitude });
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
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.headerText}>This is Test Map</Text>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: 37.78825,
                        longitude: -122.4324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                    {location &&
                        (<Marker
                            coordinate={{
                                latitude: location.latitude,
                                longitude: location.longitude,
                            }}
                            title="My Marker"
                            description="Live Location"
                        />)
                    }
                </MapView>
                <View style={styles.infoContainer}>
                    {errorMsg ? (
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    ) : location ? (
                        <Text style={styles.text}>
                            Latitude: {location.latitude} {'\n'}
                            Longitude: {location.longitude}
                        </Text>
                    ) : (
                        <Text style={styles.text}>Fetching location...</Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default TestMap;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: 400,
    },
    headerText: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 10,
        color: 'black',
    },
    infoContainer: {
        padding: 10,
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
});
