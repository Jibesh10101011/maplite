const { Schema, model } = require("mongoose");

const roomSchema = new Schema({
    roomId:{
        type:String,
        required:true,
        unique:true
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    }
});


const Room = model("Room",roomSchema);
module.exports=Room;

