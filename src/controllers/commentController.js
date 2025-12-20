const { body, param, query, validationResult } = require('express-validator');
const { Comment, Post, User } = require('../models');
const { Op } = require('sequelize');

const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment content must be between 1 and 500 characters')
];

const validatePostId = [
  param('postId')
    .isInt({ min: 1 })
    .withMessage('Invalid post ID')
];

const createComment = async (req, res) => {
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
    const { content } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = await Comment.create({
      content,
      userId: req.user.id,
      postId
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    res.status(201).json({
      success: true,
      data: commentWithUser
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  }
};

const getPostComments = async (req, res) => {
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comments = await Comment.findAndCountAll({
      where: { postId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'ASC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        comments: comments.rows,
        pagination: {
          page,
          limit,
          total: comments.count,
          pages: Math.ceil(comments.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve comments'
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  validateCreateComment,
  validatePostId
};