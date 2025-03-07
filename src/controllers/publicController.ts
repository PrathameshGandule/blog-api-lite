import { Request, Response } from "express"
import Blog from "../models/Blog.js"

const getBlogById = async (req: Request, res: Response): Promise<void> => {
	try {
		const blogId: string = req.params.id;
		const blog = await Blog.findOne({
            _id: blogId,
            state: "published"
        });
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

		const query = search ?
			{
				state: "published",
                $or: [
                    { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
                    { content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
                ]
			}
			: { state: "published" };

		const blogs = await Blog.find(query);
		res.status(200).json(blogs);
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