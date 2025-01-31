require("dotenv").config();

const exprees = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const kafkaRoute = require("./routes/kafka");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const { connectConsumer } = require("./consumer");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const http = require("http");
const Redis = require("ioredis");
const MONGO_URL = process.env.MONGO_URL;
const REDIS_URL = process.env.REDIS_URL;


const redis = new Redis(REDIS_URL);

const app = exprees();
const PORT = process.env.PORT;

const server = http.createServer(app);
const io = socketIo(server,{cors:"*"});



io.on('connection', (socket) => {
  console.log('New client connected');
  

  socket.on("subscribe",async(roomId)=>{
    if(roomId) {
      socket.join(roomId);
      console.log(`Client joined room : ${roomId}`);

      // Fetch last 50 messages from Redis (list)
      const messages = await redis.lrange(`chat:${roomId}`,0,-1);
      const parsedMessages = messages.map(msg=>JSON.parse(msg));
      socket.emit('previous_messages',parsedMessages);

    }
  });

  // Handle message sending

  socket.on('send_message', async({roomId,message,sender}) => {
    if(roomId && message) {

      const newMessage = { sender,message,timestamp: new Date().toISOString() };

      // Save message to Redis list (max 50 messages per room)

      await redis.rpush(`chat:${roomId}`,JSON.stringify(newMessage));
      await redis.ltrim(`chat:${roomId}`,-50,-1);

      console.log(`Message saved to ${roomId}: `,newMessage);

      io.to(roomId).emit('chat_message', newMessage);
    } else {
      console.log("Room ID or message is missing.");
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


async function connectDb() {
    mongoose.connect(MONGO_URL);
}
connectDb()
.then(() => {
    console.log("Databse connected");
})
.catch((err) => console.log(err));

(async () => {
    try {
        console.log("Starting Kafka consumer...");
        await connectConsumer();
        console.log("Kafka consumer connected successfully.");
    } catch (err) {
        console.error("Error initializing Kafka consumer:", err.message);
        process.exit(1); // Exit the process if Kafka fails to connect
    }
})();


app.use(cors());
app.use(bodyParser.json());
app.use("/auth",authRoute);
app.use("/api",kafkaRoute);
app.use("/room",roomRoute);


server.listen(PORT, () => {
    console.log(`App is started to localhost : ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});