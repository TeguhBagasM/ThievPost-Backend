import Comment from "../models/CommentModel.js";
import User from "../models/UserModel.js";

// Fungsi untuk mengambil semua komentar berdasarkan postId
export const getAllComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.findAll({
      where: { postId },
      include: [
        {
          model: User,
          attributes: ["id", "fullname"],
        },
      ],
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Fungsi untuk membuat komentar baru
export const createComment = async (req, res) => {
  const { content, postId } = req.body;
  const { userId } = req; // Pastikan req.userId tersedia

  try {
    // Buat komentar baru dengan menggunakan model Sequelize
    const newComment = await Comment.create({ content, userId, postId });

    // Ambil data user yang terkait dengan komentar baru
    const commentWithUser = await Comment.findOne({
      where: { id: newComment.id },
      include: [{ model: User, attributes: ["fullname"] }],
    });

    // Jika berhasil, kirim respons dengan status 201 dan data komentar yang baru dibuat beserta user
    res.status(201).json(commentWithUser);
  } catch (err) {
    // Tangani kesalahan dengan mengirim respons status 500 dan pesan kesalahan
    console.error("Error creating comment:", err);
    res.status(500).json({ error: err.message || "Failed to create comment" });
  }
};

// Fungsi untuk menghapus komentar
export const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await comment.destroy();
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
