import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { 
    CreateRoomInput, 
    ValidateRoomInput 
} from "../schemas/room.schema"; 
import { Room } from "../models/room.model";
import { uuid } from 'uuidv4';


export const handleGenerateRoomId = asyncHandler(async(
    request: Request, 
    response: Response
): Promise<void> => {
    const roomId = uuid().substring(0,8);
    response.status(200).json(
        new ApiResponse(
            200, 
            { roomId }, 
            "User successfully registered"
        )
    );
});

export const handleCreateRoom = asyncHandler(async(
    request: Request<{}, {}, CreateRoomInput>,  // <params, resBody, reqBody, reqQuery>
    response: Response
): Promise<void> => {
    const user = request.user;
    const { roomId } = request.body;
    const existRoom = await Room.findOne({roomId: roomId});

    if (existRoom) {
        throw new ApiError(400, "Room creating failed, Room ID already exists");
    }

    const newRoom = await Room.create({
        roomId,
        user
    });

    if (!newRoom) {
        throw new ApiError(500, "Internal server Error");
    }

    response.status(200).json(
        new ApiResponse(
            200,
            newRoom,
            "Room is successfully created"
        )
    );

});

export const handleValidateRoom = asyncHandler(async(
    request: Request<{}, {}, ValidateRoomInput>, 
    response: Response
): Promise<void> => {
    const { roomId } = request.body;    
    const existRoom = await Room.findOne({roomId: roomId});

    if (!existRoom) {
        throw new ApiError(400, "Room not found");
    }

    response.status(200).json(
        new ApiResponse(
            200,
            existRoom,
            "Room ID is valid"
        )
    );
});

export const getAllRooms = asyncHandler(async(
    request: Request, 
    response: Response
): Promise<void> => {
    const user = request.user;
    const rooms = await Room.find({ user: user });
    if (!rooms) {
        throw new ApiError(500, "Internal Server Error");
    }
    response.status(200).json(
        new ApiResponse(
            200,
            rooms,
            "Rooms successfully fetched"
        )
    );
});

export const handleRoomDeletion = asyncHandler(async(
    request: Request, 
    response: Response
): Promise<void> => {
   
});

