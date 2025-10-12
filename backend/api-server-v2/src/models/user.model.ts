import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};


userSchema.methods.generateAccessToken = function (): string {
  const secret = process.env.ACCESS_TOKEN_SECRET as Secret;
  if (!secret) throw new Error("ACCESS_TOKEN_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY! as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      username: this.username,
    },
    secret,
    options
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const secret = process.env.REFRESH_TOKEN_SECRET as Secret;
  if (!secret) throw new Error("REFRESH_TOKEN_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY! as SignOptions["expiresIn"]
  };

  return jwt.sign({ _id: this._id.toString() }, secret, options);
};

export const User = model<IUser>("User", userSchema);
