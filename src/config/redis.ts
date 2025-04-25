import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>; // Declare globally

const connectRedis = async (): Promise<void> => {
    try {
        if (!process.env.REDIS_URL) {
            throw new Error("REDIS_URL not defined");
        }

        redisClient = createClient({ url: process.env.REDIS_URL });

        redisClient.on("error", (err) => console.error("Redis Client Error:", err));

        await redisClient.connect();
        console.log("✅ Connected to Redis");
    } catch (err) {
        console.error("❌ Redis connection failed:", err);
    }
};

export { connectRedis , redisClient }; // Export client for reuse
