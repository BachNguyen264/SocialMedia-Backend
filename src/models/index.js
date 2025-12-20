const sequelize = require("../config/database");
const User = require("./User");
const Post = require("./Post");
const Comment = require("./Comment");
const Like = require("./Like");
const Friend = require("./Friend");

// User associations
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });

User.belongsToMany(User, {
  as: "userFriends",
  through: Friend,
  foreignKey: "userId",
  otherKey: "friendId",
});

// Post associations
Post.belongsTo(User, { foreignKey: "userId", as: "user" });
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Post.belongsToMany(User, {
  as: "likes",
  through: Like,
  foreignKey: "postId",
  otherKey: "userId",
});

// Comment associations
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Like associations
Like.belongsTo(User, { foreignKey: "userId", as: "user" });
Like.belongsTo(Post, { foreignKey: "postId", as: "post" });

// Friend associations (self-referential)
Friend.belongsTo(User, { foreignKey: "userId", as: "user" });
Friend.belongsTo(User, { foreignKey: "friendId", as: "friend" });

const db = {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  Friend,
};

module.exports = db;
