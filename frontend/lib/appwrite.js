import { configRegExp } from 'expo-router/build/fork/getStateFromPath-forks';
import { Client, Account, ID } from 'react-native-appwrite';

export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    platform : "com.jsm.aora",
    projectId: "6790c1090005c2585819",
    databseId: "6790c38d001bc4ef19d0",
    userCollectionId : "6790c3b800204ebd9d49",
    videosCollectionId : "6790c3e7000dcd5281fd",
    storageId : "6790c7020024ca1a3a5e",
}

const client = new Client();

client
.setEndpoint(appwriteConfig.endpoint)
.setProject(appwriteConfig.projectId)

const account = new Account(client);

export const createUser = () => {
    account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe')
        .then(function (response) {
            console.log(response);
        }, function (error) {
            console.log(error);
        });
}





