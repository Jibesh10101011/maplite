require("dotenv").config();
const { Kafka } = require("kafkajs");
exports.kafka = new Kafka({
    clientId: process.env.CLIENT_ID,
    brokers:[process.env.BROKERS_CONNECTING_IP],
})