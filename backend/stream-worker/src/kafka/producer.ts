import { kafka } from "../config/kafkaClient";
import { type Producer } from "kafkajs";

let producer: Producer | null = null;

export async function connectProducer(): Promise<Producer> {
    if (producer) return producer;
    
    producer = kafka.producer();
    
    try {
        await producer.connect();
        console.log("Kafka Producer connected");
    } catch (error) {
        console.error("Failed to connect Kafka Producer:", error);
        process.exit(1);
    }

    process.on("SIGINT", async () => {
        await disconnectProducer();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        await disconnectProducer();
        process.exit(0);
    });

    return producer;
}

export async function disconnectProducer() {
  if (producer) {
    try {
      await producer.disconnect();
      console.log("Kafka Producer disconnected");
    } catch (err) {
      console.error("Error disconnecting producer:", err);
    }
  }
}