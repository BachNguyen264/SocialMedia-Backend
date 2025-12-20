const { body, param, query, validationResult } = require("express-validator");
const { Post, User, Comment, Like, Friend, sequelize } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

const validateCreatePost = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Post content must be between 1 and 1000 characters"),
];

const validatePostId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid post ID"),
];

const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { content } = req.body;

    const post = await Post.create({
      content,
      userId: req.user.id,
    });

    const postWithUser = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: postWithUser,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create post",
    });
  }
};

const getPostById = async (req, res) => {
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

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Comments
              WHERE Comments.postId = Post.id
            )`),
            "commentCount",
          ],
        ],
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const userLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId: id,
      },
    });

    const postResponse = post.toJSON();
    postResponse.userHasLiked = !!userLike;

    res.json({
      success: true,
      data: postResponse,
    });
  } catch (error) {
    console.error("Get post by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve post",
    });
  }
};

const getTimeline = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = (page - 1) * limit;

    // 1️⃣ Lấy danh sách friendIds
    const friendIds = await Friend.findAll({
      where: { userId: req.user.id },
      attributes: ["friendId"],
      raw: true,
    }).then((rows) => rows.map((r) => r.friendId));

    if (friendIds.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: { page, limit, total: 0, pages: 0 },
        },
      });
    }

    // 2️⃣ Query timeline (1 query duy nhất)
    const { rows, count } = await Post.findAndCountAll({
      where: {
        userId: { [Op.in]: friendIds },
      },
      attributes: {
        exclude: ["userId"], // 👈 bỏ FK
        include: [
          // commentCount
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Comments c 
              WHERE c.postId = Post.id
            )`),
            "commentCount",
          ],
          // likeCount
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM Likes l 
              WHERE l.postId = Post.id
            )`),
            "likeCount",
          ],
          // userHasLiked (EXISTS)
          [
            sequelize.literal(`EXISTS (
              SELECT 1 
              FROM Likes l2 
              WHERE l2.postId = Post.id
              AND l2.userId = ${req.user.id}
            )`),
            "userHasLiked",
          ],
        ],
      },
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
      distinct: true,
    });

    res.json({
      success: true,
      data: {
        posts: rows,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve timeline",
    });
  }
};

module.exports = {
  createPost,
  getPostById,
  getTimeline,
  validateCreatePost,
  validatePostId,
};
