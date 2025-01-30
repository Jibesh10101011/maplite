import axios from "axios";
import { BACKEND_URL } from "@env";
import { router } from "expo-router";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"

export async function createUser(username,email,password) {
    try {
        console.log({
            username,
            email,
            password
        })
        console.log(`${BACKEND_URL}/auth/sign-up`);
        const response = await axios.post(`${BACKEND_URL}/auth/sign-up`,{username,email,password});
        console.log("User created : ",response.data);
        router.push("/(auth)/sign-in");

    } catch(error) {
        console.log("Error during signup");
        console.log(error.message);
    }
}



export async function handleSignIn(email,password) {
    try {
        console.log({email,password});
        const response = await axios.post(`${BACKEND_URL}/auth/sign-in`,{email,password});
        console.log(response.data);
        if(response.data.success) {
            const { token } = response.data;
            await AsyncStorage.setItem("token",token);
            console.log("Sign In successfull ",response.data);
            router.push("/(tabs)");
        } else {
            Alert.alert("Invalid Username or Password");
        }

    } catch(error) {
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

export async function handlCreateRoom() {
    try {
        const response = await axios.post("/room/create");
    } catch(error) {

    }
}