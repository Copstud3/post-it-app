import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - userId
 *             properties:
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Content and userId are required
 *       404:
 *         description: User not found
 */
export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { content, userId } = req.body;
  if (!content || !userId) {
    res
      .status(400)
      .json({ success: false, message: "Content and userId are required" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const post = await prisma.post.create({
      data: { content, userId },
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieve all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include both active and soft-deleted posts
 *       - in: query
 *         name: onlyDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Return only soft-deleted posts
 *     responses:
 *       200:
 *         description: List of posts, ordered by creation date (descending)
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
 *                     $ref: '#/components/schemas/Post'
 */
export const getPosts = async (
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
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Retrieve a single post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found or deleted
 */
export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post || post.deletedAt) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found or deleted
 */
export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { content, userId } = req.body;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post || post.deletedAt) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    if (post.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          message: "You can only update your own posts",
        });
      return;
    }

    const updatedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { content: content || post.content },
    });
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Soft-delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Post soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden - not the post owner
 *       404:
 *         description: Post not found or already deleted
 */
export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { userId } = req.body;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });
    if (!post || post.deletedAt) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    if (post.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own posts",
        });
      return;
    }

    const deletedPost = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ success: true, data: deletedPost });
  } catch (error) {
    next(error);
  }
};
