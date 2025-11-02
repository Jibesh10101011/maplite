import { kafkaClient } from "../config/kafka.client";
import { Consumer, EachMessagePayload } from "kafkajs";
import { redisClient } from "../config/redis.client";

let consumer: Consumer | null = null;

export const connectConsumer = async (): Promise<void> => {
  try {
    consumer = kafkaClient.consumer({ groupId: process.env.GROUP_ID! });
    await consumer.connect();
    await consumer.subscribe({ topic: "location-topic", fromBeginning: false });

    console.log("Kafka consumer connected and subscribed to 'location-topic'");

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return;
        try {
          const parsedMessage = JSON.parse(message.value.toString());
          console.log("Received Kafka message:", parsedMessage);

          const { roomId, username, latitude, longitude } = parsedMessage;

          if (!roomId || !username || latitude == null || longitude == null)
            return;

          const key = `room:${roomId}:${username}`;
          await redisClient.rpush(key, JSON.stringify({ latitude, longitude }));
          const length = await redisClient.llen(key);
          if (length > 10) {
            await redisClient.ltrim(key, length - 10, -1);
          }

          await redisClient.lpush(
            "latestMessages",
            JSON.stringify(parsedMessage)
          );
          await redisClient.ltrim("latestMessages", 0, 9);
          console.log(`Cached location for ${username} in room ${roomId}`);
        } catch (err) {
          console.error("Error processing kafka message: ", err);
        }
      },
    });

    process.on("SIGINT", async () => {
      await disconnectConsumer();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await disconnectConsumer();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to connect Kafka consumer:", error);
  }
};

export const disconnectConsumer = async (): Promise<void> => {
  if (consumer) {
    try {
      await consumer.disconnect();
      console.log("Kafka consumer disconnected");
    } catch (error) {
      console.error("Error disconnecting Kafka consumer:", error);
    }
  }
};
