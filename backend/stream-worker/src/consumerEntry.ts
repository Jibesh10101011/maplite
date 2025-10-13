import { connectConsumer } from "./kafka/consumer";

(async() => {
    console.log("Starting kafka consumer...");
    await connectConsumer();
    console.log("Kafka consumer is successfully connected");
})();