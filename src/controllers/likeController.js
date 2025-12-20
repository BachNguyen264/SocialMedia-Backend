const { param, validationResult } = require('express-validator');
const { Like, Post, User } = require('../models');
const { Op } = require('sequelize');

const validatePostId = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('Invalid post ID')
];

const likePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingLike = await Like.findOne({
      where: {
        userId: req.user.id,
        postId
      }
    });

    if (existingLike) {
      return res.status(409).json({
        success: false,
        error: 'Post already liked'
      });
    }

    await Like.create({
      userId: req.user.id,
      postId
    });

    res.json({
      success: true,
      message: 'Post liked successfully'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like post'
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const like = await Like.findOne({
      where: {
        userId: req.user.id,
        postId
      }
    });

    if (!like) {
      return res.status(404).json({
        success: false,
        error: 'Post not liked'
      });
    }

    await like.destroy();

    res.json({
      success: true,
      message: 'Post unliked successfully'
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike post'
    });
  }
};

const getPostLikes = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const likes = await Like.findAll({
      where: { postId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']]
    });

    const users = likes.map(like => like.user);

    res.json({
      success: true,
      data: {
        users,
        likeCount: likes.length
      }
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve post likes'
    });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  validatePostId
};