import { z } from "zod";

export const createUserSchema = z.object({
    body: z.object({
        username: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
        password: z.string().min(3, "Password must be at least 6 characters"),
    }),
});


export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
