import axios from "axios";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// const BACKEND_URL = "http://192.168.0.101:3000";
const BACKEND_URL_V2 = "http://192.168.0.101:8000/api/v2";
const BACKEND_STREAM_WORKER_URL = "http://192.168.0.101:5000";

// done
export async function createUser(username, email, password) {
  try {
    console.log({
      username,
      email,
      password,
    });
    console.log(`${BACKEND_URL_V2}/auth/sign-up`);
    const response = await axios.post(`${BACKEND_URL_V2}/auth/sign-up`, {
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

// done
export async function handleSignIn(email, password) {
  try {
    console.log({ email, password });
    const response = await axios.post(
      `${BACKEND_URL_V2}/auth/sign-in`,
      { email, password },
      { withCredentials: true }
    );

    console.log(response.data);
    if (response.data.statusCode == "200") {
      console.log("Sign In successfull ", response.data);
      await AsyncStorage.setItem("accessToken", response.data.data.accessToken);
      router.push("/(tabs)");
    } else {
      Alert.alert("Invalid Username or Password");
    }
  } catch (error) {
    console.log("Error During Sign In");
    router.push("/(auth)/sign-in");
  }
}

// done
export async function getProtectedData() {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    if (!token) throw new Error("No token found");

    const response = await axios.get(`${BACKEND_URL_V2}/auth/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(response.data);

    return response.data.data;
  } catch (error) {
    Alert.alert("Session expired", "Please log in again.");
    throw error; // Let the caller handle redirection
  }
}

// done
export async function handleGenerateRoomId() {
  try {
    console.log("Handle Triggered");
    const response = await axios.get(`${BACKEND_URL_V2}/room/genId`);
    const { roomId } = response.data.data;
    console.log(roomId);
    return roomId;
  } catch (error) {
    console.log(error);
    return "Error Occured";
  }
}

// done
export async function handleCreateRoom(roomId) {
  try {
    const token = await AsyncStorage.getItem("accessToken");

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

    const response = await axios.post(
      `${BACKEND_URL_V2}/room/create`,
      { roomId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  } catch (error) {
    console.log(error.message);
    Alert.alert("Some Problem Occured!");
    throw error;
  }
}


// testing
export async function handleValidateRoomAndJoin(roomId) {
  try {
    const token = await AsyncStorage.getItem("accessToken");

    const response = await axios.post(
      `${BACKEND_URL_V2}/room/validate`,
      { roomId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);

    const { success } = response.data.data;
    console.log("Sucess = ", success);
    return success;
  } catch (error) {
    Alert.alert("Some error occured!");
    throw error;
  }
}


// done
export async function handleSignOut() {
  try {
    console.log("Handle Sign Out Clicked!");
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      await AsyncStorage.removeItem("accessToken");
    }
    return router.push("/(auth)/sign-in");
  } catch (error) {
    Alert.alert("Some Problem Occured!");
    return router.push("/(tabs)");
  }
}


// done
export async function getAllRooms() {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    console.log("Token = ", token);
    const response = await axios.get(`${BACKEND_URL_V2}/room/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const rooms = response.data.data.map((ele) => ele.roomId);
    return rooms;
  } catch (error) {
    Alert.alert("Some Problem Occured!");
    throw error;
  }
}
