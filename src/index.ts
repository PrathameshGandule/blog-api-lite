import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ExpressMongoSanitize from "express-mongo-sanitize";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import checkEnvs from "./utils/envChecker.js";
dotenv.config();

// check for .env variables, connect db and redis
checkEnvs();
connectDB();
connectRedis();

// create express app
const app = express();
const PORT = Number(process.env.PORT ?? 5000);

// body, cookie, sanitize  middlewares setup respectively
app.use(express.json());
app.use(cookieParser());
app.use(ExpressMongoSanitize());
app.disable("x-powered-by")

// standard base route response
app.get('/', (req: Request, res: Response) => {
	res.status(200).json({ message: "Express + Typescript Server" });
});

import authRoutes from "./routes/authRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

// use all routes 
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/blog', blogRoutes);

// listening server on port
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));