import { Request, Response } from "express";
import { Types } from "mongoose";
import { z, ZodError } from "zod";
import Blog, { IBlog } from "../models/Blog.js";

const blogSchema = z.object({
    title: z.string(),
    content: z.string()
});

const saveBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        // take all parameters from req
        let userId: Types.ObjectId = req.user.id;
        let state = req.params.state;
        let anon = req.query.anon ? String(req.query.anon) : "false";

        // check for erros in body
        const parsedBody = blogSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { title, content } = parsedBody.data;

        // check if title update is forbidden or not
        const restrictedTitle = "[Deleted Blog]";
        const restrictedContent = "This blog has been deleted"
        if(title == restrictedTitle || content == restrictedContent){
            res.status(400).json({ message: "This title or content is not allowed" });
            return;
        }

        // check for anonymous userId existence in .env
        if (!process.env.ANONYMOUS_USER_ID) {
            throw new Error("NO ANONYMOUS_USER_ID provided in .env file!!!")
        };
        const anonymous_user = new Types.ObjectId(process.env.ANONYMOUS_USER_ID);

        // anonymous drafts are not allowed
        if (state === "draft" && anon === "true") {
            res.status(400).json({ message: "Not allowed" });
            return;
        }
        let draft: IBlog

        // if anon is true then change the userId to a global anonymous Id
        if (state === "published" && anon === "true") {
            userId = anonymous_user
        }
        draft = new Blog({
            author: userId,
            state,
            title,
            content,
        });
        await draft.save();

        // send appropriate response message
        if(state === "draft") res.status(200).json({ message: "Your draft is saved" });
        else if (state === "published" && anon === "false") res.status(200).json({ message: "Your post is published" });
        else res.status(200).json({ message: "Your post is published anonymously" });  
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const deleteBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        // take all parameters from req
        const userId: Types.ObjectId = req.user.id;
        const blogId = new Types.ObjectId(req.params.id);
        const state = req.params.state;

        // check if blog exists to delete
        const blog = await Blog.findOne({ _id: blogId, state });
        if (!blog) {
            res.status(404).json({ message: "Blog not found" });
            return;
        }

        // check if the blog belongs to user
        // note that user cannot delete the anonymous blogs they published
        if (!blog.author.equals(userId)) {
            res.status(403).json({ message: "You are not authorized to delete this blog" });
            return;
        }

        // delete the blog from database if it's a draft
        if (state === "draft") {
            await Blog.findByIdAndDelete(blogId);
        } else {
            await Blog.findByIdAndUpdate(blogId, {             // change the title and content of 
                $set: {                                        // blog if it's published
                    title: "[Deleted Blog]",
                    content: "This blog has been deleted"
                }
            });
        }
        res.status(200).json({ message: `${state} blog deleted successfully` });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const publishDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        // check for anonymous user id's existence in .env
        if (!process.env.ANONYMOUS_USER_ID) {
            throw new Error("NO ANONYMOUS_USER_ID provided in .env file!!!")
        };
        const anonymous_user = new Types.ObjectId(process.env.ANONYMOUS_USER_ID);

        // take all parameters from req
        const anon = req.query.anon ? String(req.query.anon) : "false";
        const userId: Types.ObjectId = req.user.id;
        const draftId = new Types.ObjectId(req.params.id);

        // check if draft exists to publish
        const draft = await Blog.findOne({ _id: draftId, state: "draft" });
        if (!draft) {
            res.status(404).json({ message: "Draft not found" });
            return;
        }

        // check if draft belongs to the user
        if (!draft.author.equals(userId)) {
            res.status(403).json({ message: "You are not authorized to publish this blog" });
            return;
        }

        // if blog is to be published anonymously set the userId to global anonymous id
        if (anon === "true") draft.author = anonymous_user

        // change the draft state to published
        draft.state = "published"
        await draft.save();

        // send appropriate response message
        if (anon === "true") res.status(200).json({ message: "Draft published anonymously" });
        else res.status(200).json({ message: "Draft published" });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        // check for errors in body
        const parsedBody = blogSchema.safeParse(req.body);
        if (!parsedBody.success) {
            res.status(400).json({ message: "Invalid input data", errors: parsedBody.error.errors });
            return;
        }
        const { title, content } = parsedBody.data;

        // take all parameters from req
        const userId: Types.ObjectId = req.user.id;
        const state: string = req.params.state;
        const blogId = new Types.ObjectId(req.params.id);
        const blog = await Blog.findOne({ _id: blogId, state });

        // check if blog exists
        if (!blog) {
            res.status(404).json({ message: `${state} blog not found` });
            return;
        }

        // check if the blog belongs to user
        // note that user connot edit the anonymous blog once they are published
        if (!blog.author.equals(userId)) {
            res.status(403).json({ message: "You are not authorized to delete this blog" });
            return;
        }

        // check if title update is forbidden or not
        const restrictedTitle = "[Deleted Blog]";
        const restrictedContent = "This blog has been deleted"
        if(title == restrictedTitle || content == restrictedContent){
            res.status(400).json({ message: "This title or content is not allowed" });
            return;
        }

        // update the title and content
        blog.title = title;
        blog.content = content;
        await blog.save();
        res.status(200).json({ message: `${state} blog updated successfully` });
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const getBlogsWithSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        // take parameters from req
        const search = req.body.search ? String(req.body.search) : false;
        const userId: Types.ObjectId = req.user.id;
        const state = req.params.state;

        // build the query accordingly if search exists or not 
        const query = search ?
            {
                author: userId,
                state,
                $or: [
                    { title: { $regex: search, $options: "i" } }, // Case-insensitive search in title
                    { content: { $regex: search, $options: "i" } }, // Case-insensitive search in content
                ]
            }
            : { author: userId, state };

        // execute the query
        const blogs = await Blog.find(query);
        res.status(200).json(blogs);
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        // take all parameters from req
	    const userId = req.user.id;
        const blogId = new Types.ObjectId(req.params.id);
        const state = req.params.state;

        // here get the blogs by the user only
        const blog = await Blog.findOne({ author: userId, _id: blogId, state });
        res.status(200).json(blog)
    } catch (err) {
        console.error("❌ Some error occurred:", err);
        res.status(500).json({ message: "Internal Server Error" });
        return;
    }
}

export {
    saveBlog,
    deleteBlog,
    updateBlog,
    getBlogsWithSearch,
    getBlogById,
    publishDraft
}

