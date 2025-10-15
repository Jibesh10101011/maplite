import { Schema, model, Document, Types } from "mongoose";

export interface IRoom extends Document {
    roomId: string;
    user: Types.ObjectId;
}

const roomSchema = new Schema<IRoom>({
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


export const Room = model<IRoom>("Room",roomSchema);

