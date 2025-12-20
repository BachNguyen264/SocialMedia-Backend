const { param, validationResult } = require('express-validator');
const { Friend, User } = require('../models');
const { Op } = require('sequelize');

const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID')
];

const addFriend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot add yourself as a friend'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const existingFriendship = await Friend.findOne({
      where: {
        userId: req.user.id,
        friendId: userId
      }
    });

    if (existingFriendship) {
      return res.status(409).json({
        success: false,
        error: 'Already friends with this user'
      });
    }

    await Friend.create({
      userId: req.user.id,
      friendId: userId
    });

    await Friend.create({
      userId: userId,
      friendId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add friend'
    });
  }
};

const removeFriend = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const friendship = await Friend.findOne({
      where: {
        userId: req.user.id,
        friendId: userId
      }
    });

    if (!friendship) {
      return res.status(404).json({
        success: false,
        error: 'Not friends with this user'
      });
    }

    await Friend.destroy({
      where: {
        [Op.or]: [
          { userId: req.user.id, friendId: userId },
          { userId: userId, friendId: req.user.id }
        ]
      }
    });

    res.json({
      success: true,
      message: 'Friend removed successfully'
    });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove friend'
    });
  }
};

const getUserFriends = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const friends = await Friend.findAll({
      where: { userId },
      include: [{
        model: User,
        as: 'friend',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [[{ model: User, as: 'friend' }, 'firstName', 'ASC']]
    });

    const friendList = friends.map(friendship => friendship.friend);

    res.json({
      success: true,
      data: friendList
    });
  } catch (error) {
    console.error('Get user friends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user friends'
    });
  }
};

module.exports = {
  addFriend,
  removeFriend,
  getUserFriends,
  validateUserId
};