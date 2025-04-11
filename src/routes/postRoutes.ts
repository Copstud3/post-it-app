import express, { Router, Request, Response, NextFunction } from "express";
import { 
  createPost, 
  getPosts, 
  getPost, 
  updatePost, 
  deletePost 
} from "../controllers/postController";

// Explicitly type router as Router
const router: Router = express.Router();

// Wrap async handlers to handle errors and promises correctly
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a new post - POST /posts
router.post("/posts", asyncHandler(createPost));

// Get all uposts - GET /posts
router.get("/posts", asyncHandler(getPosts));

// Get a single post - GET /posts/:id
router.get("/posts/:id", asyncHandler(getPost));

// Update a post - PUT /posts/:id
router.put("/posts/:id", asyncHandler(updatePost));

// Delete a post (soft delete) - DELETE /posts/:id
router.delete("/posts/:id", asyncHandler(deletePost));

export default router;