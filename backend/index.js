require("dotenv").config();

const exprees = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
// const kafkaRoute = require("./routes/kafkaRoutes");
const authRoute = require("./routes/auth");
const { connectConsumer } = require("./consumer");
const mongoose = require("mongoose");


const app = exprees();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

console.log("MONGOURL = ",MONGO_URL);

async function connectDb() {
    mongoose.connect(MONGO_URL);
}
connectDb()
.then(() => {
    console.log("Databse connected");
})
.catch((err) => console.log(err));

// (async () => {
//     try {
//         console.log("Starting Kafka consumer...");
//         await connectConsumer();
//         console.log("Kafka consumer connected successfully.");
//     } catch (err) {
//         console.error("Error initializing Kafka consumer:", err.message);
//         process.exit(1); // Exit the process if Kafka fails to connect
//     }
// })();



app.use(cors());
app.use(bodyParser.json());
app.use("/auth",authRoute);
// app.use("/api",kafkaRoute);

app.listen(PORT, () => console.log('Server running on port 3000'));