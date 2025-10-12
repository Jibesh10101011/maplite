import { JwtPayload } from "jsonwebtoken";

declare global {
    interface AccessTokenPayload extends JwtPayload {
        _id: string;
        email: string;
        username: string;
    };    
}