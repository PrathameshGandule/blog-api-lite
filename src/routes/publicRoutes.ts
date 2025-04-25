import { Router } from "express";

import { 
	getBlogById, 
	getBlogsWithSearch 
} from "../controllers/publicController.js";

import validateBlogParams from "../middlewares/blogMiddleware.js";

const router = Router();

// public routes
router.get('/', getBlogsWithSearch)
router.get('/:id', validateBlogParams("id"), getBlogById);

export default router;