import { z } from "zod";

export const Coordinate = z.object({
    latitude: z.number(),
    longitude: z.number()
});

export const CoordinateSchema = z.object({
    body: z.object({
        roomId: z.string().min(1, { message: "Room Id is required" }),
        userId: z.string().min(1, { message: "User Id is required" }),
        source: Coordinate,
        destination: Coordinate
    })
});


export type CoordinateInput = z.infer<typeof CoordinateSchema>["body"];
