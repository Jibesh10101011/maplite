import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL!;

export const redisClient = new Redis(redisUrl);

redisClient.on("connect", () => {
    console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
    console.error("Redis connection error: ", err);
});

