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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const friends = await Friend.findAll({
      where: { userId: req.user.id },
      attributes: ["friendId"],
    });

    const friendIds = friends.map((f) => f.friendId);

    if (friendIds.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        },
      });
    }

    const posts = await Post.findAndCountAll({
      where: {
        userId: {
          [Op.in]: friendIds,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      attributes: {
        exclude: ["userId"],
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Comments
              WHERE Comments.postId = Post.id
            )`),
            "commentCount",
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM Likes
              WHERE Likes.postId = Post.id
            )`),
            "likeCount",
          ],
        ],
      },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const postsWithUserLikes = await Promise.all(
      posts.rows.map(async (post) => {
        const userLike = await Like.findOne({
          where: {
            userId: req.user.id,
            postId: post.id,
          },
        });

        const postResponse = post.toJSON();
        postResponse.userHasLiked = !!userLike;
        return postResponse;
      })
    );

    res.json({
      success: true,
      data: {
        posts: postsWithUserLikes,
        pagination: {
          page,
          limit,
          total: posts.count,
          pages: Math.ceil(posts.count / limit),
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
