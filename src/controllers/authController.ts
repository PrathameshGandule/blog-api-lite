import bcryptjs from "bcryptjs";
import jwt from 'jsonwebtoken';
import { z } from "zod";
import { Request, Response } from "express";
import { configDotenv } from "dotenv";
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
})

const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsedBody = registrationSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { name, email, password } = parsedBody.data;

        const hashedPassword = await hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
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
        const parsedBody = loginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email, password } = parsedBody.data;

        const user = await User.findOne({ email });

        if (!user) {
            res.status(404).json({
                message: `User with username ${email} not found !`
            });
            return;
        }

        const isMatch: boolean = await compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid Password !" })
            return;
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("NO JWT_SECRET provided in .env file!!!")
        }
        const jwt_secret = process.env.JWT_SECRET;
        const token: string = sign(
            { id: user._id },
            jwt_secret,
            { expiresIn: "5d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 5 * 24 * 60 * 60 * 1000
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

export { register, login };