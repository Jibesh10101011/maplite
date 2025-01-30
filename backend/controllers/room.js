const { v4:uuidv4 } = require('uuid');

const handleGenerateRoomId = (req,res) => {
    try {
        console.log("Get Received")
        const roomId = uuidv4().substring(0,8);
        console.log("Room Id = ",roomId);
        return res.status(200).json({success:true,roomId});
    } catch(error) {
        return res.status(400).json({sucess:false,roomId:"Error Occured"})
    }
};

const handleCreateRoom = async (req,res) => {
    try {

    } catch(error) {

    }
};

module.exports = { handleGenerateRoomId, handleCreateRoom };
