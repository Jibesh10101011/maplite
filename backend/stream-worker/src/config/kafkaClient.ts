import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

export const kafka = new Kafka({
  clientId: process.env.CLIENT_ID!,
  brokers: [process.env.BROKERS_CONNECTING_IP!],
});