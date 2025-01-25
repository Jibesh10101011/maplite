const { Router } = require("express");
const router = Router();
const { getKafkaMessages,handleSendLoaction } = require("../controllers/kafkaController");

router.route("/get-kafka-messages").get(getKafkaMessages)
router.route("/send-location").post(handleSendLoaction);


module.exports=router;