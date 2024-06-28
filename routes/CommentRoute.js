import express from "express";
import { getAllComments, createComment, deleteComment } from "../controllers/CommentController.js";

import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

// Route untuk mengambil semua komentar
router.get("/posts/:postId/comments", verifyUser, getAllComments);

// Route untuk membuat komentar baru
router.post("/comments", verifyUser, createComment);

// Route untuk menghapus komentar
router.delete("/comments/:id", verifyUser, deleteComment);

export default router;
