import Post from "../models/PostModel.js";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import User from "../models/UserModel.js";
import { v4 as uuidv4 } from "uuid";

export const getTotalPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const totalPosts = await Post.count({ where: { userId: userId } });
    console.log("totalPosts:", totalPosts); // Pastikan totalPosts tercetak dengan benar di console backend
    res.json({ totalPosts });
  } catch (error) {
    console.error("Error fetching total posts:", error); // Pastikan error tercetak di console backend jika ada masalah
    res.status(500).json({ error: "Error fetching total posts" });
  }
};

export const getPostPublic = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        status: "public",
      },
      include: [
        {
          model: User,
          attributes: ["fullname"],
        },
      ],
      order: [
        ["updatedAt", "DESC"], // Urutkan berdasarkan createdAt secara menurun (posting terbaru di atas)
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostAll = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        status: ["public", "private"],
      },
      include: [
        {
          model: User,
          attributes: ["fullname"],
        },
      ],
      order: [
        ["updatedAt", "DESC"], // Urutkan berdasarkan createdAt secara menurun (posting terbaru di atas)
      ],
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPosts = async (req, res) => {
  try {
    let response;
    if (req.role === "admin") {
      response = await Post.findAll({
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["fullname", "email"],
          },
        ],
        order: [
          ["updatedAt", "DESC"], // Urutkan berdasarkan createdAt secara menurun (posting terbaru di atas)
        ],
      });
    } else {
      response = await Post.findAll({
        where: {
          userId: req.userId,
        },
        include: [
          {
            model: User,
            attributes: ["fullname", "email"],
          },
        ],
        order: [
          ["updatedAt", "DESC"], // Urutkan berdasarkan createdAt secara menurun (posting terbaru di atas)
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!post) return res.status(404).json({ msg: "Data tidak ditemukan" });
    let response;
    if (req.role === "admin") {
      response = await Post.findOne({
        attributes: ["title", "description", "status"],
        where: {
          id: post.id,
        },
        include: [
          {
            model: User,
            attributes: ["fullname", "email"],
          },
        ],
      });
    } else {
      response = await Post.findOne({
        attributes: ["title", "description", "status"],
        where: {
          [Op.and]: [{ id: post.id }, { userId: req.userId }],
        },
        include: [
          {
            model: User,
            attributes: ["fullname", "email"],
          },
        ],
      });
    }
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// PostController.js

// Create Post
export const createPost = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ msg: "No File Uploaded" });
    }

    const { title, description, status } = req.body;
    const userId = req.userId; // Ambil userId dari req

    const file = req.files.image;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedTypes = [".png", ".jpg", ".jpeg"];

    if (!allowedTypes.includes(ext.toLowerCase())) {
      return res.status(422).json({ msg: "Invalid Image Format" });
    }
    if (fileSize > 5000000) {
      return res.status(422).json({ msg: "Image size should be less than 5 MB" });
    }

    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) {
        console.error("Failed to upload image:", err);
        return res.status(500).json({ msg: "Failed to upload image" });
      }

      try {
        const newPost = await Post.create({
          title,
          description,
          image: fileName,
          url,
          status,
          userId: userId, // Set userId
        });

        res.status(201).json({ msg: "Post Created Successfully", post: newPost });
      } catch (error) {
        console.error("Failed to create post:", error);
        res.status(500).json({ msg: "Failed to create post" });
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  const postId = req.params.id;
  const { title, description, status } = req.body;
  const userId = req.userId; // Ambil userId dari req

  try {
    const existingPost = await Post.findByPk(postId);
    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== userId && req.role !== "admin") {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    let imageFileName = existingPost.image;
    if (req.files && req.files.image) {
      const file = req.files.image;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      const newFileName = uuidv4() + ext;
      const allowedTypes = [".png", ".jpg", ".jpeg"];

      if (!allowedTypes.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid Image Format" });
      }
      if (fileSize > 5000000) {
        return res.status(422).json({ msg: "Image size should be less than 5 MB" });
      }

      const filePath = `./public/images/${newFileName}`;
      try {
        await file.mv(filePath);

        const oldFilePath = `./public/images/${existingPost.image}`;
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }

        imageFileName = newFileName;

        await existingPost.update({
          title,
          description,
          image: imageFileName,
          url: `${req.protocol}://${req.get("host")}/images/${imageFileName}`,
          status,
          userId,
        });

        return res.status(200).json({ message: "Post updated successfully" });
      } catch (err) {
        console.error("Failed to upload image:", err);
        return res.status(500).json({ msg: "Failed to upload image" });
      }
    } else {
      await existingPost.update({
        title,
        description,
        status,
        userId,
      });

      return res.status(200).json({ message: "Post updated successfully" });
    }
  } catch (error) {
    console.error("Error updating post:", error.message);
    return res.status(500).json({ error: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const postId = req.params.id;

  try {
    // Cari post dengan ID yang sesuai
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Hapus gambar terkait jika ada
    if (post.image) {
      const imagePath = `./public/images/${post.image}`;
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Hapus post dari database
    await post.destroy();

    return res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    return res.status(500).json({ error: "Failed to delete post" });
  }
};
