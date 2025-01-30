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


const app = exprees();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const server = http.createServer(app);
const io = socketIo(server,{cors:"*"});



io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on("subscribe",(channel)=>{
    if(channel) {
      socket.join(channel);
    }
  });

  socket.on('send_message', ({channel,message}) => {
    if(channel) {
      console.log(message);
      io.to(channel).emit('chat_message', message);
    } else {
      console.log("No Channel is found");
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