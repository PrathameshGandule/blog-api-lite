import rateLimit from "express-rate-limit";

// Rate limit for creating a new blog post
export const createBlogLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 blog creations per hour
    message: "Too many blogs created, please wait before creating more.",
});

// Rate limit for updating blogs
export const updateBlogLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 20, // Limit each IP to 20 updates per 30 minutes
    message: "Too many updates, slow down and try again later.",
});

// Rate limit for deleting blogs
export const deleteBlogLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 5 blog deletions per hour
    message: "Too many blogs deleted, please try again later.",
});

// Rate limit for publishing a blog (changing state)
export const publishBlogLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 5 publishes per hour
    message: "Too many publish requests, please try again later.",
});

export const generalGetLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 400, // Limit each IP to 300 requests per windowMs
    message: "Too many requests, please slow down and try again later.",
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Higher Limit for Authenticated Users
export const authUserGetLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 500, // Higher request cap for authenticated users
    message: "Too many requests, try again later.",
});

// Rate limit for user registration
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registrations per hour
    message: "Too many registration attempts, please try again later.",
});

// Rate limit for user login
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per 15 minutes
    message: "Too many login attempts, please wait before trying again.",
});

// Rate limit for forgot password requests
export const forgotPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 5, // Limit each IP to 5 forgot-password requests per 30 minutes
    message: "Too many password reset requests, please try again later.",
});

// Rate limit for sending OTP
export const sendOTPLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 OTP requests per 10 minutes
    message: "Too many OTP requests, please wait before requesting again.",
});

// Rate limit for verifying OTP
export const verifyOTPLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 OTP verifications per 10 minutes
    message: "Too many OTP verification attempts, please try again later.",
});