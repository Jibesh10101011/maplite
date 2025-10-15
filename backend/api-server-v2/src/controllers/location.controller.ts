import { type Request, type Response } from "express";
import { redisClient } from "../config/redisClient";
import { ApiResponse } from "../utils/ApiResponse";

export const getLocationCoordinates = async (request: Request,response: Response) => {

    const { roomId } = request.params;
    const roomKeys = await redisClient.keys(`room:${roomId}:*`);
    if (roomKeys.length === 0) {
        return response.status(200).json(
            new ApiResponse(
                200,
                {},
                "No messages available for this room"
            )
        )
    }

    const data = await Promise.all(
        roomKeys.map(async (key) => {
            const username = key.split(":")[2];
            const lastLocation = await redisClient.lindex(key, -1); 
            return {
                username,
                ...(lastLocation ? JSON.parse(lastLocation) : {}),
            };
        })
    );

    response.status(200).json(
        new ApiResponse(
            200,
            data,
            "Data successfully fetched"
        )
    );
}


