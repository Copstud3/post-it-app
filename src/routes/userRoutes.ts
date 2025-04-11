import express, { Router, Request, Response, NextFunction } from "express";
import { 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} from "../controllers/userController";

// Explicitly type router as Router
const router: Router = express.Router();

// Wrap async handlers to handle errors and promises correctly
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => 
    Promise.resolve(fn(req, res, next)).catch(next);

// Create a new user - POST /users
router.post("/", asyncHandler(createUser));

// Get all users - GET /users
router.get("/", asyncHandler(getUsers));

// Get a single user - GET /users/:id
router.get("/:id", asyncHandler(getUser));

// Update a user - PUT /users/:id
router.put("/:id", asyncHandler(updateUser));

// Delete a user (soft delete) - DELETE /users/:id
router.delete("/:id", asyncHandler(deleteUser));

export default router;