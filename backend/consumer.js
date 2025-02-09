require("dotenv").config();
const { kafka } = require("./clientKafka");
const { kafkaMessages,kafkaCahce } = require("./cache");
const consumer = kafka.consumer({ groupId:process.env.GROUP_ID });

/*

let kafkaCache = {
    roomId_1 : {
        username1 : [ {latitude:12,longitude:13},{latitude:14,longitude:15},... ]
        username2 : [ {latitude:13,longitude:14},{latitude:14,longitude:15},... ]
        username3 : [ {latitude:14,longitude:15},{latitude:14,longitude:15},... ]
        ...
    },
    roomId_2 : {
        username11 : [ {latitude:12,longitude:13},{latitude:14,longitude:15},... ]
        username21 : [ {latitude:13,longitude:14},{latitude:14,longitude:15},... ]
        username33 : [ {latitude:14,longitude:15},{latitude:14,longitude:15},... ]
        ...
    }
    ....
}

*/

const connectConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'location-topic', fromBeginning: false });

    // Continuously listen to messages and update the cache
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const parsedMessage = JSON.parse(message.value.toString());
            console.log('Received Kafka message:', parsedMessage);
            
            const roomId = parsedMessage.roomId;
            const username = parsedMessage.username;
            const latitude = parsedMessage.latitude;
            const longitude = parsedMessage.longitude;

            if(!kafkaCahce[roomId]) kafkaCahce[roomId] = {};
            if(!kafkaCahce[roomId][username]) kafkaCahce[roomId][username] = []


            kafkaCahce[roomId][username].push({latitude,longitude});
            kafkaMessages.push(parsedMessage);

            // Limit cache size (e.g., keep only the last 10 messages)
            if (kafkaCahce[roomId][username].length > 10) {
                kafkaCahce[roomId][username].shift();
            }
            if (kafkaMessages.length > 10 ) kafkaMessages.shift();

        },
    });

}


module.exports = { connectConsumer }

