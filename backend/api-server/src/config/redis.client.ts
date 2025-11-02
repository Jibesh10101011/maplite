import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

export const redisClient = new Redis(redisUrl);
export const publisher = new Redis(redisUrl);
export const subscriber = new Redis(redisUrl);

// connection events
redisClient.on("connect", () => console.log("Connected to Redis"));
publisher.on("connect", () => console.log("Publisher connection successfull"));
subscriber.on("connect", () => console.log("Subscriber connection successfull"));

// Error events
redisClient.on("error", (err) => console.log("Redis connection Error: ", err));
publisher.on("error", (err) => console.log("Publisher connection Error: ", err));
subscriber.on("error", (err) => console.log("Subscriber connection Error: ", err));

// Reconnection
subscriber.on("close", () => console.warn("Subscriber disconnected, will attempt reconnect..."));
publisher.on("close", () => console.warn("Publisher disconnected, will attempt reconnect..."));




