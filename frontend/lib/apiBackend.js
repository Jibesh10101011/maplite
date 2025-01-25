import axios from "axios";
import { BACKEND_URL } from "@env";

export async function createUser(username,email,password) {
    try {
        console.log({
            username,
            email,
            password
        })

        const response = await axios.post(`${BACKEND_URL}/auth/sign-up`,{username,email,password});

        console.log("User created : ",response.data);

    } catch(error) {
        console.log("Error during signup");
        console.log(error.message);
    }
}

