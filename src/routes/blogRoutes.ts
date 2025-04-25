import { Router } from "express"

import {
	saveBlog,
    deleteBlog,
    updateBlog,
    publishDraft,
    getBlogsWithSearch,
    getBlogById
} from "../controllers/blogController.js"

import verifyToken from "../middlewares/authMiddleware.js";
import validateBlogParams from "../middlewares/blogMiddleware.js";

const router = Router();

// blog routes
router.post('/:state', verifyToken, validateBlogParams("state", "anon"), saveBlog); //?anon=true query for anonymous publishing
router.delete('/:state/:id', verifyToken, validateBlogParams("state", "id"), deleteBlog);
router.put('/:state/:id', verifyToken, validateBlogParams("state", "id"), updateBlog);
router.post('/publish/:id', verifyToken, validateBlogParams("id", "anon"), publishDraft); //?anon=true query for anonymous publishing
router.get('/:state', verifyToken, validateBlogParams("state"), getBlogsWithSearch);
router.get('/:state/:id', verifyToken, validateBlogParams("state", "id"), getBlogById);

export default router;