import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Stack,router } from 'expo-router';
import { getProtectedData } from '@/lib/apiBackend';

const MapLayout = () => {

  const [user,setUser]=useState<any>();

  useEffect(()=>{
    const fetchUser = async () => {
      try {
        const userData = await getProtectedData();
        console.log("User Data = ",userData);
        setUser(userData.user);
      } catch (error) {
        router.replace("/(auth)/sign-in"); // Redirect on failure
      }
    };
    fetchUser();
  },[]);
  return (
    <View style={{ flex: 1 }}>
      {/* Stack should only contain Stack.Screen components for routing */}
      <Stack>
        <Stack.Screen 
          name="test-map" 
          options={{ headerShown: false }} 
        />
         <Stack.Screen 
          name="map-kafka" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="chat-room"
          options={{  headerShown:false }}
        />
      
      </Stack>

      {/* Custom content like Text or StatusBar should be placed outside the Stack */}
      <Text style={styles.text}>Map</Text>
      <StatusBar backgroundColor="#161622" style="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MapLayout;
