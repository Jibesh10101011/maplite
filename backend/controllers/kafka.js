const { kafkaMessages } = require("../cache");
const { producer } = require("../producer");

const getKafkaMessages = (req,res) => {
    console.log("Get received");
    let n=2;
    // Serve messages from the cache
    let kafkaMessagesData = kafkaMessages.slice(-n);
    console.log("Kafka Messages:", kafkaMessagesData);

    if (kafkaMessages.length > 0) {
        console.log({message: kafkaMessagesData});
        res.status(200).send({ success: true, message: kafkaMessagesData });
    } else {
        res.status(200).send({ success: true, message: 'No messages available' });
    }
}


const handleSendLoaction = async(req,res)=>{
    try {
        console.log("Post Received");
        const { latitude, longitude } = req.body;

        const coordinatesArray = [
                // {
                //     value:JSON.stringify({
                //         username:"Jibesh Roy",
                //         latitude,
                //         longitude
                //     }),
                // },
                {
                    value:JSON.stringify({
                        username:"Srinjan Dutta",
                        latitude:latitude+Math.random(),
                        longitude:longitude+Math.random()
                    }),
                },
                {
                    value:JSON.stringify({
                        username:"Kaustav Dey",
                        latitude:latitude+Math.random(),
                        longitude:longitude+Math.random()
                    })
                }
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