import { Router } from "express"
import { register, login, changePassword } from "../controllers/authController.js";
import { sendOtpToUser , verifyOtpFromUser } from "../controllers/otpController.js";

const router = Router();

// auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', changePassword);
router.post('/send-otp', sendOtpToUser);
router.post('/verify-otp', verifyOtpFromUser);

export default router;