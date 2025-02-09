require("dotenv").config();

const exprees = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const kafkaRoute = require("./routes/kafka");
const authRoute = require("./routes/auth");
const roomRoute = require("./routes/room");
const redisRoute = require("./routes/test");
const { connectConsumer } = require("./consumer");
const mongoose = require("mongoose");
const http = require("http");
const MONGO_URL = process.env.MONGO_URL;
const socketIo = require("./socket");
const app = exprees();
const PORT = process.env.PORT;

const server = http.createServer(app);
// Initialize socket.io
socketIo(server);


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
app.use("/redis",redisRoute);


server.listen(PORT, () => {
    console.log(`App is started to localhost : ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});