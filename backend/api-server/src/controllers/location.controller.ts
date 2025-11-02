import { type Request, type Response } from "express";
import { UserRoomInput, type CoordinateInput } from "../schemas/location.schema";
import { publisher, redisClient } from "../config/redisClient";
import { ApiResponse } from "../utils/ApiResponse";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const getLocationCoordinates = asyncHandler(async (
    request: Request,
    response: Response
) => {

    const { roomId } = request.params;
    const roomKeys = await redisClient.keys(`room:${roomId}:*`);

    console.log(roomKeys);
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
});


export const shortestPathCache = asyncHandler(async (
    request: Request<{}, {}, UserRoomInput>,
    response: Response
): Promise<void> => {
    const { roomId, userId } = request.body;
    const cacheKey = `coordinates:${roomId}:${userId}`;
    const coordinates = await redisClient.get(cacheKey);
    response.status(200).json(
        new ApiResponse(
            200,
            coordinates ? JSON.parse(coordinates) : [],
            "Coorinat"
        )
    );
});

export const getShortestPathCoordinates = asyncHandler(async (
    request: Request<{}, {}, CoordinateInput>, 
    response: Response
): Promise<Response | void> => {

    console.log("Received Request");

    const { source, destination, userId, roomId } = request.body;
    const cacheKey = `coordinates:${roomId}:${userId}`;
    
    // const data = await redisClient.get(cacheKey);
    // if (data) {
    //     console.log("Received from Cache");
    //     return response.status(200).json(
    //         new ApiResponse(
    //             200,
    //             JSON.parse(data),
    //             "Coordinates are successfully fetched"
    //         )
    //     );
    // }

    console.log("API Invoked");
    try {
        const OSRM_API = `https://router.project-osrm.org/route/v1/driving/${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
        const responseOsrm =await axios.get(OSRM_API);
        const routeCoordinates = responseOsrm.data.routes[0].geometry.coordinates;
        await redisClient.set(cacheKey, JSON.stringify({routeCoordinates, roomId, userId}));
        response.status(200).json(
            new ApiResponse(
                200,
                {routeCoordinates, roomId, userId},
                "Coordinates are successfully fetched"
            )
        ); 

        redisClient.publish(`shortest-path:${roomId}`, cacheKey);

    } catch (error) {
        throw new ApiError(500, "Internal server Error");
    }
});


export const testLocation = asyncHandler(async (request: Request, response: Response) => {
    await publisher.publish(`hello:${Math.random()*100}`, "Hello Jibesh");
    console.log("Msg published");
    response
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Nice"
        )
    );
});