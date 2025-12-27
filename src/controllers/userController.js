const { body, param, query, validationResult } = require("express-validator");
const { User, Post, Comment, Like, Friend, sequelize } = require("../models");
const { Op } = require("sequelize");

const validateUpdateUser = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
];

const validateUserId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid user ID"),
];

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const whereClause = {
      id: { [Op.ne]: req.user.id },
    };

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "firstName", "lastName", "email"],
      order: [
        ["firstName", "ASC"],
        ["lastName", "ASC"],
      ],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === Number(id)) {
      // optional: reject
      return res.status(400).json({
        success: false,
        error: "Use api/users/me instead",
      });
    }

    const user = await User.findByPk(id, {
      attributes: ["id", "firstName", "lastName", "email", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const friendship = await Friend.findOne({
      where: {
        userId: req.user.id,
        friendId: id,
      },
    });

    const userResponse = user.toJSON();
    userResponse.isFriend = !!friendship;

    res.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user",
    });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const posts = await Post.findAndCountAll({
      where: { userId: userId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          page,
          limit,
          total: posts.count,
          pages: Math.ceil(posts.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user posts",
    });
  }
};

const getUserComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const comments = await Comment.findAndCountAll({
      where: { userId: id },
      include: [
        {
          model: Post,
          as: "post",
          attributes: ["id", "content"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      data: {
        comments: comments.rows,
        pagination: {
          page,
          limit,
          total: comments.count,
          pages: Math.ceil(comments.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user comments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user comments",
    });
  }
};

const getUserLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const likes = await Like.findAndCountAll({
      where: { userId: id },
      include: [
        {
          model: Post,
          as: "post",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const posts = likes.rows.map((like) => ({
      ...like.post.toJSON(),
      likedAt: like.createdAt,
    }));

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: likes.count,
          pages: Math.ceil(likes.count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get user likes error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve user likes",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "firstName", "lastName", "email", "createdAt"],
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve profile",
    });
  }
};

const updateMe = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    await User.update(updateData, {
      where: { id: req.user.id },
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ["id", "firstName", "lastName", "email", "updatedAt"],
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update me error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

module.exports = {
  getMe,
  updateMe,
  getAllUsers,
  getUserById,
  getMyPosts,
  getUserComments,
  getUserLikes,
  validateUpdateUser,
  validateUserId,
};

/*
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { id } = req.params;

    if (parseInt(id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own profile",
      });
    }

    const { firstName, lastName } = req.body;
    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;

    await User.update(updateData, {
      where: { id: req.user.id },
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ["id", "firstName", "lastName", "email", "updatedAt"],
    });

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user",
    });
  }
};
*/
