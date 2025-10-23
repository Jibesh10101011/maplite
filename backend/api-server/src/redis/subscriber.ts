import { subscriber } from "../config/redisClient";
import { redisClient } from "../config/redisClient";
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
            mapNamespace.to(`coordinate:${roomId}`).emit("shortest-path-coordinates", {
            roomId,
            userId,
            routeCoordinates,
            });
        } catch (err) {
            console.error("Failed to parse Redis data:", err);
        }
        }
    );
}
