const { v4:uuidv4 } = require('uuid');
const Room = require("../models/room");
const { validateToken } = require('../services/authentication');

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
        const {token,roomId} = req.body;
        const payload = validateToken(token);
        console.log("Post Request Received");
        console.log(payload);
        await Room.create({roomId,user:payload.id});
        return res.json({success:true,message:"Room Created Successfully"});
    } catch(error) {
        return res.json({success:false,message:error.message});
    }
};

const handleValidateRoom = async (req,res) => {
    try {
        const { roomId } = req.body;
        const room = await Room.findOne({roomId});
        if(room) return res.status(200).json({success:true});
        else return res.status(401).json({success:false});
    } catch(error) {
        return res.status(400).json({success:false});
    }
}

const getAllRooms = async (req,res) => {
    try {
        const userId = req.headers.userid;
        const rooms = await Room.find({user:userId});
        return res.status(200).json({rooms:rooms.map((ele)=>ele.roomId)});
    } catch(error) {
        console.log("Error while getRoom : ",error.message)
        return res.status(401).json({success:false,rooms:[]});
    }
}

module.exports = { handleGenerateRoomId, handleCreateRoom, handleValidateRoom, getAllRooms };
