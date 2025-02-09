const socketIo = require("socket.io");
const redis = require("./redis"); // Assuming you have a redis client setup

module.exports = (server) => {
  const io = socketIo(server, { cors: "*" });
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("subscribe", async (roomId) => {
      if (roomId) {
        socket.join(roomId);
        console.log(`Client joined room: ${roomId}`);

        // Fetch last 50 messages from Redis
        const messages = await redis.lrange(`chat:${roomId}`, 0, -1);
        const parsedMessages = messages.map((msg) => JSON.parse(msg));
        socket.emit("previous_messages", parsedMessages);
      }
    });

    socket.on("send_message", async ({ roomId, message, sender }) => {
      if (roomId && message) {
        const newMessage = { sender, message, timestamp: new Date().toISOString() };

        // Save message to Redis
        await redis.rpush(`chat:${roomId}`, JSON.stringify(newMessage));
        await redis.ltrim(`chat:${roomId}`, -50, -1);

        console.log(`Message saved to ${roomId}: `, newMessage);

        io.to(roomId).emit("chat_message", newMessage);
      } else {
        console.log("Room ID or message is missing.");
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};
