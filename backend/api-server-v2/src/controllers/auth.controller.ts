import { type Request, type Response, type CookieOptions } from "express";
import { type CreateUserInput, type LoginInput } from "../schemas/user.schema";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { IUser, User } from "../models/user.model";

export const handleSignIn = asyncHandler(async(
    request: Request<{}, {}, LoginInput>,   // <params, resBody, reqBody, reqQuery>
    response: Response
): Promise<void> => {
    const { email, password } = request.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new ApiError(400, "User with current email not found");
    }

    const isPasswordCorrect = user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Failed to signIn due to Invalid password");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const options: CookieOptions = {
        httpOnly: true,
        secure: true,
    }

    const payload: AccessTokenPayload = {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
    }

    response.
        status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: payload, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

}); 

export const handleSignUp = asyncHandler(async(
    request: Request<{}, {}, CreateUserInput>,
    response: Response
): Promise<void> => {
    const { username, email, password } = request.body;
    const existUser = await User.findOne({email: email});

    if (existUser) {
        throw new ApiError(400, "User already exists");
    }

    const newUser = await User.create({
        username,
        email,
        password
    });

    if (!newUser) {
        throw new ApiError(500, "Internal server Error");
    }

    response.status(200).json(
        new ApiResponse(
            200, 
            { id: newUser._id }, 
            "User successfully registered"
        )
    );

});

