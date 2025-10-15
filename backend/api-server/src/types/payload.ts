import { JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
    _id: string;
    email: string;
    username: string;
}
