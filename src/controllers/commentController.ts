import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /posts/{postId}/comments:
 *   post:
 *     summary: Create a comment under a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               - content
 *               - userId
 *             properties:
 *               content:
 *                 type: string
 *               userId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Content and userId are required
 *       404:
 *         description: Post or user not found
 */
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { postId } = req.params;
  const { content, userId } = req.body;
  if (!content || !userId) {
    res
      .status(400)
      .json({ success: false, message: "Content and userId are required" });
    return;
  }
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId), deletedAt: null },
    });
    if (!post) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const comment = await prisma.comment.create({
      data: { content, userId, postId: parseInt(postId) },
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{postId}/comments:
 *   get:
 *     summary: Retrieve all comments under a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Include both active and soft-deleted comments
 *       - in: query
 *         name: onlyDeleted
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Return only soft-deleted comments
 *     responses:
 *       200:
 *         description: List of comments
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
 *                     $ref: '#/components/schemas/Comment'
 */
export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { postId } = req.params;
  const { includeDeleted, onlyDeleted } = req.query as {
    includeDeleted?: string;
    onlyDeleted?: string;
  };
  try {
    let where: any = { postId: parseInt(postId) };

    if (onlyDeleted === "true") {
      where = { ...where, deletedAt: { not: null } };
    } else if (includeDeleted !== "true") {
      where = { ...where, deletedAt: null };
    }

    const comments = await prisma.comment.findMany({ where });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{postId}/comments/{id}:
 *   get:
 *     summary: Retrieve a single comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found or deleted
 */
export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { postId, id } = req.params;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id), postId: parseInt(postId) },
      include: {
        user: { select: { id: true, username: true, avatarUrl: true } },
      },
    });
    if (!comment || comment.deletedAt) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{postId}/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
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
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden - not the comment owner
 *       404:
 *         description: Comment not found or deleted
 */
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { postId, id } = req.params;
  const { content, userId } = req.body;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id), postId: parseInt(postId) },
    });
    if (!comment || comment.deletedAt) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }
    if (comment.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          message: "You can only update your own comments",
        });
      return;
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content: content || comment.content },
    });
    res.status(200).json({ success: true, data: updatedComment });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /posts/{postId}/comments/{id}:
 *   delete:
 *     summary: Soft-delete a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The post ID
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The comment ID
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
 *         description: Comment soft-deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden - not the comment owner
 *       404:
 *         description: Comment not found or already deleted
 */
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { postId, id } = req.params;
  const { userId } = req.body;
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id), postId: parseInt(postId) },
    });
    if (!comment || comment.deletedAt) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }
    if (comment.userId !== userId) {
      res
        .status(403)
        .json({
          success: false,
          message: "You can only delete your own comments",
        });
      return;
    }

    const deletedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
    res.status(200).json({ success: true, data: deletedComment });
  } catch (error) {
    next(error);
  }
};
