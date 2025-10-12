require("dotenv").config();
const REDIS_URL = process.env.REDIS_URL;
const Redis = require("ioredis");
const redis = new Redis(REDIS_URL);

const handleGetKeys = async(req,res) => {
    try {
        const keys = await redis.keys("*");
        console.log("KEYS = ",keys);
        return res.status(200).json({keys});
    }   catch(error) {
        return res.status(400).json({error});
    }
}

const handleDeleteKeys = async(req,res) => {
    try {
        await redis.flushall();
        return res.status(200).json({message:"All keys deleted successfully"});
    } catch(error) {
        return res.status(400).json({error});
    }
}


const handleGetMessage = async(req,res) => {
    try {
        const { roomId } = req.params;
        let messages = await redis.lrange(`chat:${roomId}`,0,-1);
        messages = messages.map(ele=>JSON.parse(ele));
        console.log(messages);
        return res.status(200).json({messages});
    } catch(error) {
        return res.status(400).json({error});
    }
}


module.exports = { handleGetKeys,handleDeleteKeys,handleGetMessage };