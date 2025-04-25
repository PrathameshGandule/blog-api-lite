import jwt, { JwtPayload } from 'jsonwebtoken';
const { verify } = jwt;
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

interface userPL extends JwtPayload{
    user: {
        id: Types.ObjectId
    }
}

declare global {
    namespace Express {
        interface Request {
            user: userPL
        }
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token: string | undefined = req.cookies?.token;

    // check for cookies
    if (!token) {
        res.status(401).json({ message: "Access Denied. No token provided." });
        return;
    }
    const jwt_secret = process.env.JWT_SECRET;

    // check for jwt secret
    if (!jwt_secret) {
        console.error("❌ No JWT secret provided.");
		res.status(500).json({ message: "Internal Server Error" });
        return; 
    }

    // decode user and set it paste it to req body to use further
    try {
        const decodedUser = verify(token, jwt_secret) as userPL;
        req.user = decodedUser;
        next();
    } catch (err) {
        console.error("❌ Token verification error:", err instanceof Error ? err.message : err);
		res.status(403).json({ message: "Invalid or expired token" }); 
        return; 
    }
};

export default verifyToken;
