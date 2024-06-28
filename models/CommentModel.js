// models/CommentModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Post from "./PostModel.js";
import User from "./UserModel.js"; // Import model User

const { DataTypes } = Sequelize;

const Comment = db.define(
  "comments",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

// Definisikan hubungan antara Comment dan User
Comment.belongsTo(User, { foreignKey: "userId" }); // Setiap comment terkait dengan satu user
User.hasMany(Comment, { foreignKey: "userId" }); // Satu user dapat memiliki banyak comments

// Definisikan hubungan antara Comment dan Post
Comment.belongsTo(Post, { foreignKey: "postId" }); // Setiap comment terkait dengan satu post
Post.hasMany(Comment, { foreignKey: "postId" }); // Satu post dapat memiliki banyak comments

export default Comment;
