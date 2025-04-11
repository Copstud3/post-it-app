import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { generateRandomAvatar, generateAvatarTag } from "../utils/avatar";

const prisma = new PrismaClient();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Email and username are required
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email and username are required"
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email or username already exists"
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, username } = req.body;
  if (!email || !username) {
    res
      .status(400)
      .json({ success: false, message: "Email and username are required" });
    return;
  }
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }], deletedAt: null },
    });
    if (existingUser) {
      res
        .status(409)
        .json({ success: false, message: "Email or username already exists" });
      return;
    }

    const avatarUrl = await generateRandomAvatar(email);
    const avatarTag = generateAvatarTag(username, avatarUrl);
    const user = await prisma.user.create({
      data: { email, username, avatarUrl, avatarTag },
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieves all users from the database, with options to include or only show soft-deleted users based on query parameters.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, includes both active and soft-deleted users; otherwise, only active users are returned
 *       - in: query
 *         name: onlyDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: If true, returns only soft-deleted users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { includeDeleted, onlyDeleted } = req.query as {
    includeDeleted?: string;
    onlyDeleted?: string;
  };
  try {
    let where: any = {};

    if (onlyDeleted === "true") {
      where = { deletedAt: { not: null } };
    } else if (includeDeleted !== "true") {
      where = { deletedAt: null };
    } // Else, where remains {} for all records

    const users = await prisma.user.findMany({ where });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a single user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user || user.deletedAt) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 *       409:
 *         description: Email already in use by another user
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Email already in use by another user"
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { email, username } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user || user.deletedAt) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (email && email !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
        res
          .status(409)
          .json({
            success: false,
            message: "Email already in use by another user",
          });
        return;
      }
    }

    let avatarUrl = user.avatarUrl;
    let avatarTag = user.avatarTag;
    if (email && email !== user.email) {
      avatarUrl = await generateRandomAvatar(email);
      avatarTag = generateAvatarTag(username || user.username, avatarUrl);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email: email || user.email,
        username: username || user.username,
        avatarUrl,
        avatarTag,
      },
    });
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft-delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or already deleted
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "User not found"
 */
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user || user.deletedAt) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const deletedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ success: true, data: deletedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         email:
 *           type: string
 *         username:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         avatarTag:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     UserInput:
 *       type: object
 *       required:
 *         - email
 *         - username
 *       properties:
 *         email:
 *           type: string
 *         username:
 *           type: string
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         content:
 *           type: string
 *         userId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         content:
 *           type: string
 *         userId:
 *           type: integer
 *         postId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
