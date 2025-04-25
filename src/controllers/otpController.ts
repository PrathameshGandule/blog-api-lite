import { Request, Response } from "express";
import { generateOtp, sendOtp } from "../utils/otpUtil.js";
import { redisClient } from "../config/redis.js";
import bcryptjs from "bcryptjs";
const { hash, compare } = bcryptjs;
import { z } from "zod";

const sendSchema = z.object({
    email: z.string().email()
})

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6)
})

const sendOtpToUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse the correct body requiremt of mail
        const parsedBody = sendSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email } = parsedBody.data;

        // checking if email is already verified
        const isEmailVerified = await redisClient.get(`email_verified${email}`);
        if(isEmailVerified === "true"){
            res.status(400).json({ success: false, message: "Your email is already verified" });
            return;
        }

        // checking for cooldown period 
        const isCoolDown = await redisClient.get(`otp_cooldown:${email}`);
        if(isCoolDown === "true"){
            res.status(400).json({success: false,  message: "Please try after 1 minute" });
            return;
        }

        // generating and hashing otp
        const otp = generateOtp();
        const hashedOtp = await hash(otp, 8);
        await redisClient.setEx(`otp:${email}`, 120, hashedOtp);

        // checking if mail sending is successfull
        const isMailSent = await sendOtp(email, otp);
        if(!isMailSent){
            res.status(500).json({ success: false, message: "Unable to send mail" });
            return;
        }

        // setting cooldown period
        await redisClient.setEx(`otp_cooldown:${email}`, 60, "true");
        res.status(200).json({ success: true, message: "Otp sent successfully" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
        return;
    }
}

const verifyOtpFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Parse the correct body requirement for mail and otp
        const parsedBody = verifySchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ success: false, message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { email, otp } = parsedBody.data;

        // checking is hashed otp exists
        const storedOtpHash = await redisClient.get(`otp:${email}`);
        if (!storedOtpHash) {
            res.status(400).json({ success: false, message: "OTP expired" });
            return;
        }

        // comaparing if otp's match
        const isMatch = await compare(otp, storedOtpHash);
        if (!isMatch){
            res.status(400).json({ success: false, message: "Incorrect OTP" });
            return;
        }

        // deleting otp and setting verified as true
        await redisClient.del(`otp:${email}`);
        await redisClient.setEx(`email_verified:${email}`, 300, "true");
        res.status(200).json({ success: true, message: "OTP verified successfully! You have 5 minutes for further operation" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ success: false,  message: "Internal Server Error" });
        return;
    }
}

export { sendOtpToUser , verifyOtpFromUser };