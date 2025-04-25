import { Request, Response } from "express"
import Blog from "../models/Blog.js"
import { Types } from "mongoose";

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
        // take parameters from req
		const blogId = new Types.ObjectId(req.params.id);

        // find the blog and populate by author id
		const blog = await Blog.findOne({
            _id: blogId,
            state: "published"
        }).select("-__v -updatedAt").populate("author", "name").exec();
		res.status(200).json(blog);
		return;
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
	try {
		const search = req.body.search ? String(req.body.search) : false;

        // build the query according to search
		const query = search ?
			{
				state: "published",
                $or: [
                    { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
                    { content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
                ]
			}
			: { state: "published" };

        // populate by author Id
		const blogs = await Blog.find(query).select("-__v -updatedAt").populate("author", "name").exec();
		res.status(200).json({ length: blogs.length, blogs });
	} catch (err) {
		console.error("❌ Some error occurred:", err);
		res.status(500).json({ message: "Internal Server Error" });
		return;
	}
}

export {
	getBlogById,
	getBlogsWithSearch
}