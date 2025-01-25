import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Stack } from 'expo-router';

const MapLayout = () => {
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
