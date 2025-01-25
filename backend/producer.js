const { kafka } = require("./client");
const producer = kafka.producer();

(async () => {
    await producer.connect();
    console.log('Kafka Producer connected');
})();


module.exports = {producer};