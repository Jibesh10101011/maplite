import { type Request, type Response } from "express";
import { connectProducer } from "../kafka/producer";
import { ApiReponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";


export async function handleCoordinates(
    request: Request, 
    response: Response
): Promise<void> {

    
    const producer = await connectProducer();
    
    try {        
        const { latitude, longitude, roomId, username } = request.body;
        const coordinatesArray = [
            {
                value: JSON.stringify({
                    username,
                    roomId,
                    latitude,
                    longitude,
                }),
            },
        ];
        
        await producer.send({
            topic: "location-topic",
            messages: coordinatesArray,
        });
        
        response
            .status(200)
            .json(new ApiReponse(200,{},"location tracking successfull"))

    } catch (error) {
        console.error("Error sending location to Kafka:", error);
        throw new ApiError(200, "Internal Server Error");
    }
}
