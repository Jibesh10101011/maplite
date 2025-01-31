require("dotenv").config();
const { kafka } = require("./clientKafka");
const { kafkaMessages } = require("./cache");
const consumer = kafka.consumer({ groupId:process.env.GROUP_ID });

const connectConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'location-topic', fromBeginning: false });

    // Continuously listen to messages and update the cache
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const parsedMessage = JSON.parse(message.value.toString());
            console.log('Received Kafka message:', parsedMessage);
            kafkaMessages.push(parsedMessage);

            // Limit cache size (e.g., keep only the last 10 messages)
            if (kafkaMessages.length > 30) {
                kafkaMessages.shift();
            }
        },
    });

}


module.exports = { connectConsumer }

