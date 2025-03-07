import jwt, { JwtPayload } from 'jsonwebtoken';
const { verify } = jwt;
import { Request, Response, NextFunction } from 'express';

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload;
        }
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    const token: string | undefined = req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "Access Denied. No token provided." });
        return;
    }
    const jwt_secret = process.env.JWT_SECRET;
    if (!jwt_secret) {
        console.error("❌ No JWT secret provided.");
		res.status(500).json({ message: "Internal Server Error" });
        return; 
    }

    try {
        const decodedUser = verify(token, jwt_secret) as JwtPayload;
        req.user = decodedUser;
        next();
    } catch (err: unknown) {
        console.error("❌ Token verification error:", err instanceof Error ? err.message : err);
		res.status(403).json({ message: "Invalid or expired token" }); 
        return; 
    }
};

export default verifyToken;
