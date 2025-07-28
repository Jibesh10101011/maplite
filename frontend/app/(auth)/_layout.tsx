import { Alert, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Stack,router } from 'expo-router';
import { getProtectedData } from '@/lib/apiBackend';

const AuthLayout = () => {

    useEffect(()=>{
      const fetchUser = async () => {
        try {
          const userData = await getProtectedData();
          console.log("User Data = ",userData);
          Alert.alert("User Already Signed In");
          router.replace("/(tabs)");
        } catch (error) {
           // Redirect on failure
        }
      };
      fetchUser();
    },[]);

  return (
    <View style={{ flex: 1 }}>
      {/* Stack should only contain Stack.Screen components for routing */}
      <Stack>
        <Stack.Screen 
          name="sign-in" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="sign-up" 
          options={{ headerShown: false }} 
        />
      </Stack>

      {/* Custom content like Text or StatusBar should be placed outside the Stack */}
      <Text style={styles.text}>This is Auth</Text>
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

export default AuthLayout;
