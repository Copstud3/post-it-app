import express, { Router, Request, Response, NextFunction } from "express";
import { 
  createComment, 
  getComments, 
  getComment, 
  updateComment, 
  deleteComment 
} from "../controllers/commentController";

const router: Router = express.Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a comment - POST /posts/:postId/comments
router.post("/posts/:postId/comments", asyncHandler(createComment));

// Get all comments under a post - GET /posts/:postId/comments
router.get("/posts/:postId/comments", asyncHandler(getComments));

// Get a single comment - GET /posts/:postId/comments/:id
router.get("/posts/:postId/comments/:id", asyncHandler(getComment));

// Update a comment - PUT /posts/:postId/comments/:id
router.put("/posts/:postId/comments/:id", asyncHandler(updateComment));

// Delete a comment (soft delete) - DELETE /posts/:postId/comments/:id
router.delete("/posts/:postId/comments/:id", asyncHandler(deleteComment));

export default router;