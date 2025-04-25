import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import { z } from "zod";
import { Request, Response } from "express";
import { configDotenv } from "dotenv";
import { redisClient } from "../config/redis.js";
import User from "../models/User.js"
configDotenv();

const { hash, compare } = bcryptjs;
const { sign } = jwt;

const registrationSchema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    password: z.string()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const changePassSchema = z.object({
    email: z.string().email(),
    newPassword: z.string()
})

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // check for erros in body schema
        const parsedBody = registrationSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { name, email, password } = parsedBody.data;

        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ message: "User with this email already exists, You may Login" });
            return;
        }

        // check if email is verified through otp
        const isVerified = await redisClient.get(`email_verified:${email}`)
        if (isVerified !== "true") {
            res.status(403).json({ message: "Verify your email first" });
            return;
        }

        // hashing the password and saving new user
        const hashedPassword = await hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        // delete the email verified field from redis
        await redisClient.del(`email_verified:${email}`);
        res.status(201).json({
            message: `User registered with email ${email}`
        });
    } catch (error) {
        console.error("❌ Some error occurred:", error);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // check for erros in body
        const parsedBody = loginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email, password } = parsedBody.data;

        // check if user exists or not
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({
                message: `User with email ${email} not found !`
            });
            return;
        }

        // check if passwords match
        const isMatch: boolean = await compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid Password !" })
            return;
        }

        // check for jwt secret
        if (!process.env.JWT_SECRET) {
            throw new Error("NO JWT_SECRET provided in .env file!!!")
        }
        const jwt_secret = process.env.JWT_SECRET;

        // sign a jwt token of userId with 24h of expiry 
        const token: string = sign(
            { id: user._id },
            jwt_secret,
            { expiresIn: "24h" }
        )

        // send this token through http only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.status(200).json({
            message: "Login successful",
        });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // check for errors in body
        const parsedBody = changePassSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email, newPassword } = parsedBody.data;

        // check if email id verified through otp
        const isVerified = await redisClient.get(`email_verified:${email}`)
        if (isVerified !== "true") {
            res.status(403).json({ message: "Verify your email first" });
            return;
        }

        // check if user exists or not 
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "This user doesn't exist" });
            return;
        }

        // hash new password and save it
        const hashedNewPassword = await hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();

        // delete the email verified field from redis
        await redisClient.del(`email_verified:${email}`);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

export { register, login, changePassword };