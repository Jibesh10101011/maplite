const { kafkaMessages, kafkaCahce } = require("../cache");
const { producer } = require("../producer");

const getKafkaMessages = (req,res) => {

    const { roomId } = req.params;
    console.log("Get received");
    let n=2;
    // Serve messages from the cache
    // let kafkaMessagesData = kafkaCahce[roomId].slice(-n);
    let kafkaMessagesData = kafkaMessages.slice(-n);
    console.log("Kafka Messages:", kafkaMessagesData);
    console.log("Kafka Cache = ",kafkaCahce[roomId]);

    if (kafkaMessages.length > 0) {
        console.log({message: kafkaMessagesData});
        res.status(200).send({ success: true, message: kafkaMessagesData, messageCache:kafkaCahce[roomId] });
    } else {
        res.status(200).send({ success: true, message: 'No messages available' });
    }
}


const handleSendLoaction = async(req,res)=>{
    try {
        console.log("Post Received");
        const { latitude, longitude, roomId, username } = req.body;

        const coordinatesArray = [
                {
                    value:JSON.stringify({
                        username,
                        roomId,
                        latitude,
                        longitude
                    }),
                },         
        ]
        await producer.send({
            topic: 'location-topic',
            messages: coordinatesArray,
        });
        res.status(200).send({ success: true, message: 'Location sent to Kafka' });

    } catch (error) {
        console.error('Error sending location to Kafka:', error);
        res.status(500).send({ success: false, error: 'Failed to send location' });
    }
}


module.exports={getKafkaMessages,handleSendLoaction};


