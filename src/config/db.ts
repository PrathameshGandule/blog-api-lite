import { connect } from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
	try {
		if (!process.env.MONGO_URI) {
			throw new Error("Mongo URI not provided in env variable");
		}
		const connectionString: string = process.env.MONGO_URI;
		await connect(connectionString);
		console.log("MongoDB database connected")
	} catch (err: unknown) {
		console.error("❌ Some error occurred:", err instanceof Error ? err.message : err);
		process.exit(1);
	}
}

export default connectDB;