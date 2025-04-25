import { Schema, model } from "mongoose";
import { Types , Document } from "mongoose";

interface IBlog extends Document{
    author: Types.ObjectId,
    state: string,
    title: string,
    content: string,
}

const blogSchema = new Schema<IBlog>({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    state: { type: String, enum: ["published", "draft"], required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const Blog = model<IBlog>("Blog", blogSchema);

export type { IBlog };
export default Blog;
