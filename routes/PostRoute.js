// routes/PostRoutes.js
import express from "express";
import {
  getPosts,
  getPostPublic,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostAll,
  getTotalPostsByUser,
} from "../controllers/PostController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/posts", verifyUser, getPosts);
router.get("/postpub", getPostPublic);
router.get("/allposts", getPostAll);
router.get("/posts/:id", verifyUser, getPostById);
router.post("/posts", verifyUser, createPost);
router.patch("/posts/:id", verifyUser, updatePost);
router.delete("/posts/:id", verifyUser, deletePost);

router.get("/posts/user/:userId/count", getTotalPostsByUser);

export default router;
