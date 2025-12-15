import { kafkaClient } from "../config/kafka.client";
import { redisClient } from "../config/redis.client";
import { Consumer, EachMessagePayload } from "kafkajs";

let consumer: Consumer | null = null;

const roomBuffers: Record<string, Record<string, any>> = {};
const THROTTLE_MS = 300;
let publishTimer: NodeJS.Timeout | null = null;


const publishAggregatedUpdates = async () => {
  try {
    for (const roomId in roomBuffers) {
      const users = roomBuffers[roomId];

      const snapshot = {
        roomId,
        users: Object.values(users),
        ts: Date.now()
      };

      const channel = `location-room:${roomId}`;
      await redisClient.publish(channel, JSON.stringify(snapshot));
      console.log(`Snapshot published to ${channel}`);
    }
  } catch (err) {
    console.error("Error publishing snapshot:", err);
  }
};

export const connectConsumer = async (): Promise<void> => {
  try {
    consumer = kafkaClient.consumer({ groupId: process.env.GROUP_ID! });
    await consumer.connect();
    await consumer.subscribe({ topic: "location-topic", fromBeginning: false });

    console.log("Kafka consumer ready. Subscribed to location-topic");

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          const data = JSON.parse(message.value.toString());
          const { roomId, userId, latitude, longitude } = data;

          if (!roomId || !userId || latitude == null || longitude == null)
            return;

          if (!roomBuffers[roomId]) {
            roomBuffers[roomId] = {};
          }

          roomBuffers[roomId][userId] = {
            userId,
            latitude,
            longitude,
            ts: Date.now()
          };

          if (!publishTimer) {
            publishTimer = setTimeout(() => {
              publishAggregatedUpdates();
              publishTimer = null; // Reset timer
            }, THROTTLE_MS);
          }
        } catch (err) {
          console.error("Error processing Kafka message:", err);
        }
      }
    });

    process.on("SIGINT", async () => {
      await disconnectConsumer();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await disconnectConsumer();
      process.exit(0);
    });
  } catch (err) {
    console.error("Kafka consumer connection failed:", err);
  }
};

export const disconnectConsumer = async (): Promise<void> => {
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log("Kafka consumer disconnected");
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  }
};