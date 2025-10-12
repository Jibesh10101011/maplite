import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

console.log(process.env.BROKERS_CONNECTING_IP)
console.log(process.env.CLIENT_ID)

export const kafka = new Kafka({
  clientId: process.env.CLIENT_ID!,
  brokers: [process.env.BROKERS_CONNECTING_IP!],
});