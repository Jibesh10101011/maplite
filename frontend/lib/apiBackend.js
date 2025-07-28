import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const BACKEND_URL = "http://192.168.0.101:3000";

export async function createUser(username, email, password) {
  try {
    console.log({
      username,
      email,
      password,
    });
    console.log(`${BACKEND_URL}/auth/sign-up`);
    const response = await axios.post(`${BACKEND_URL}/auth/sign-up`, {
      username,
      email,
      password,
    });
    console.log("User created : ", response.data);
    router.push("/(auth)/sign-in");
  } catch (error) {
    console.log("Error during signup");
    console.log(error.message);
  }
}

export async function handleSignIn(email, password) {
  try {
    console.log({ email, password });
    const response = await axios.post(`${BACKEND_URL}/auth/sign-in`, {
      email,
      password,
    });
    console.log(response.data);
    if (response.data.success) {
      const { token } = response.data;
      await AsyncStorage.setItem("token", token);
      console.log("Sign In successfull ", response.data);
      router.push("/(tabs)");
    } else {
      Alert.alert("Invalid Username or Password");
    }
  } catch (error) {
    console.log("Error During Sign In");
    router.push("/(auth)/sign-in");
  }
}

export async function getProtectedData() {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const response = await axios.get(`${BACKEND_URL}/auth/validate-token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.data.success) throw new Error("Invalid token");

    return response.data;
  } catch (error) {
    Alert.alert("Session expired", "Please log in again.");
    throw error; // Let the caller handle redirection
  }
}

export async function handleGenerateRoomId() {
  try {
    console.log("Handle Triggered");
    const response = await axios.get(`${BACKEND_URL}/room/genId`);
    console.log(response.data);
    const { roomId } = response.data;
    return roomId;
  } catch (error) {
    console.log(error);
    return "Error Occured";
  }
}

export async function handleCreateRoom(roomId) {
  try {
    const token = await AsyncStorage.getItem("token");

    console.log("Handle Create Room Triggered : ", token);
    console.log(roomId);

    if (!token) {
      Alert.alert("Need to Authorized");
      return router.push(`/(auth)/sign-in`);
    }

    if (!roomId && !roomId.length) {
      Alert.alert("Create a Valid Room ID");
      return router.push(`/(tabs)/create`);
    }

    const response = await axios.post(`${BACKEND_URL}/room/create`, {
      token,
      roomId,
    });
    const { success } = response.data;
    return success;
  } catch (error) {
    console.log(error.message);
    Alert.alert("Some Problem Occured!");
    throw error;
  }
}

export async function handleValidateRoomAndJoin(roomId) {
  try {
    const response = await axios.post(`${BACKEND_URL}/room/validate`, {
      roomId,
    });
    const { success } = response.data;
    return success;
  } catch (error) {
    Alert.alert("Some error occured!");
    throw error;
  }
}

export async function handleSignOut() {
  try {
    console.log("Handle Sign Out Clicked!");
    const token = await AsyncStorage.getItem("token");
    if (token) {
      await AsyncStorage.removeItem("token");
    }
    return router.push("/(auth)/sign-in");
  } catch (error) {
    Alert.alert("Some Problem Occured!");
    return router.push("/(tabs)");
  }
}

export async function getAllRooms(userId) {
  try {
    if (userId) {
      console.log("User ID = ", userId);
      const response = await axios.get(`${BACKEND_URL}/room/all`, {
        headers: { userId },
      });
      const { rooms } = response.data;
      return rooms;
    } else {
      Alert.alert("Invalid UserId");
      return [];
    }
  } catch (error) {
    Alert.alert("Some Problem Occured!");
    throw error;
  }
}
