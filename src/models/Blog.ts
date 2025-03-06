import { Schema, model } from "mongoose";
import { Types } from "mongoose";

interface IBlog extends Document {
    author: Types.ObjectId,
    title: string,
    content: string,
    published: boolean
}

const blogSchema = new Schema<IBlog>({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
}, { timestamps: true });

const Blog = model<IBlog>("Blog", blogSchema);

export type { IBlog };
export default Blog;
