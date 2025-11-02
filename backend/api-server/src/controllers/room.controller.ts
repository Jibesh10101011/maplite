import { type Request, type Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { CreateRoomInput, DeleteRoomInput, ValidateRoomInput } from "../schemas/room.schema";
import { Room } from "../models/room.model";
import { uuid } from "uuidv4";
import { redisClient } from "../config/redis.client";

export const handleGenerateRoomId = asyncHandler(
  async (request: Request, response: Response): Promise<void> => {
    const roomId = uuid().substring(0, 8);
    response
      .status(200)
      .json(new ApiResponse(200, { roomId }, "User successfully registered"));
  }
);

export const handleCreateRoom = asyncHandler(
  async (
    request: Request<{}, {}, CreateRoomInput>, // <params, resBody, reqBody, reqQuery>
    response: Response
  ): Promise<void> => {
    const user = request.user;
    const { roomId } = request.body;
    const existRoom = await Room.findOne({ roomId: roomId });

    if (existRoom) {
      throw new ApiError(400, "Room creating failed, Room ID already exists");
    }

    const newRoom = await Room.create({
      roomId,
      user,
    });

    if (!newRoom) {
      throw new ApiError(500, "Internal server Error");
    }

    response
      .status(200)
      .json(new ApiResponse(200, newRoom, "Room is successfully created"));
  }
);

export const handleValidateRoom = asyncHandler(
  async (
    request: Request<{}, {}, ValidateRoomInput>,
    response: Response
  ): Promise<void> => {
    const { roomId } = request.body;
    const existRoom = await Room.findOne({ roomId: roomId });

    if (!existRoom) {
      throw new ApiError(400, "Room not found");
    }

    response
      .status(200)
      .json(new ApiResponse(200, { success: true }, "Room ID is valid"));
  }
);

export const getAllRooms = asyncHandler(
  async (request: Request, response: Response): Promise<void> => {
    const user = request.user;
    const rooms = await Room.find({ user: user._id }).select("roomId -_id");
    console.log("Rooms: ", rooms);
    response
      .status(200)
      .json(new ApiResponse(200, rooms, "Rooms successfully fetched"));
  }
);

export const handleRoomDeletion = asyncHandler(
  async (
    request:Request,
    response: Response
  ): Promise<void> => {
    const { roomId } = request.params;

    if (!roomId)
        throw new ApiError(404, "Room Id is required");

    const user = request.user;
    const existingRoom = await Room.findOne({ user: user._id, roomId });
    if (!existingRoom) {
      throw new ApiError(404, "Room not found");
    }

    try {
      await redisClient.del(`chat:${roomId}`);
      const coordinateKeys = await redisClient.keys(`coordinates:${roomId}:*`);
      if (coordinateKeys.length > 0) {
        await Promise.all(coordinateKeys.map((key) => redisClient.del(key)));
      }

      console.log(`Redis cleanup done for room: ${roomId}`);
    } catch (err: any) {
      console.warn("Redis cleanup failed:", err.message);
    }

    try {
      await Room.deleteOne({ _id: existingRoom._id });
      console.log(`MongoDB: Room ${roomId} deleted successfully`);
    } catch (err: any) {
      console.error("MongoDB deletion error:", err.message);
      throw new ApiError(500, "Failed to delete room from database");
    }

    response
      .status(200)
      .json(new ApiResponse(200, {}, `RoomId: ${roomId} successfully deleted`));
  }
);
