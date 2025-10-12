import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret, TokenExpiredError } from "jsonwebtoken";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { CookieOptions } from "express";

interface AccessTokenPayload extends JwtPayload {
  _id: string;
  email: string;
  username: string;
}

export const verifyJWT = asyncHandler(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    let decoded: AccessTokenPayload | null = null;
    let user = null;

    if (accessToken) {
      try {
        decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET! as Secret) as AccessTokenPayload;
        user = await User.findById(decoded._id).select("-password -refreshToken");
        if (!user) throw new ApiError(401, "Invalid Access Token");

        req.user = user;
        return next();
      } catch (err) {
        if (!(err instanceof TokenExpiredError)) throw err;
      }
    }

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET! as Secret) as JwtPayload & { _id: string };
    user = await User.findById(decodedRefresh._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "User not found");

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    const cookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("accessToken", newAccessToken, cookieOptions);
    res.cookie("refreshToken", newRefreshToken, cookieOptions);

    req.user = user;

    next();
  } catch (error: unknown) {
    if (error instanceof TokenExpiredError) {
      throw new ApiError(401, "Refresh token expired");
    }
    throw new ApiError(401, error instanceof Error ? error.message : "Invalid token");
  }
});
