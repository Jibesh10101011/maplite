import { z } from "zod";

export const createRoomSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
  }),
});


export const validateRoomSchema = z.object({
  body: z.object({
    roomId: z.string().min(1, "Room ID is required"),
  }),
});

export const deleteRoomSchema = z.object({
  params: z.object({
    roomId: z.string().min(1, "Room Id is required"),
  }),
});


export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"];
export type ValidateRoomInput = z.infer<typeof validateRoomSchema>["body"];
export type DeleteRoomInput = z.infer<typeof deleteRoomSchema>["params"];