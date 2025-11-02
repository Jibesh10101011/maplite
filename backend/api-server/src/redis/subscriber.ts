import { subscriber } from "../config/redis.client";
import { redisClient } from "../config/redis.client";
import { Server as SocketIOServer } from "socket.io";

export async function initSubscriber(io: SocketIOServer): Promise<void> {
    console.log("Subscribing to events...");
    const mapNamespace = io.of("/map");
    await subscriber.psubscribe("shortest-path:*");
    subscriber.on(
        "pmessage",
        async (pattern: string, channel: string, cacheKey: string) => {
        const data = await redisClient.get(cacheKey);
        console.log("Subscribed Data = ", data);
        if (!data) return;
        try {
            const { roomId, userId, routeCoordinates } = JSON.parse(data);
            mapNamespace.to(`coordinate:${roomId}`).emit("shortest-path-coordinates", 
                {
                    roomId,
                    userId,
                    routeCoordinates,
                }
            );
        } catch (err) {
            console.error("Failed to parse Redis data:", err);
        }
        }
    );
}


export async function initLocationSubscriber(io: SocketIOServer): Promise<void> {
    console.log("Subscribing to Coordinates....");
    const mapNamespace = io.of("/map");
    await subscriber.psubscribe("location-room:*");
    subscriber.on(
        "pmessage",
        async (pattern: string, channel: string, data: string) => {
            const { roomId, userId, latitude, longitude } = await JSON.parse(data);
            console.log(`RoomId : ${roomId}, Emitted Data: Lat: ${latitude}, Long: ${longitude}`);
            mapNamespace
            .to(`coordinate:${roomId}`)
            .emit("current_location", { userId, latitude, longitude });
        }
    );
}