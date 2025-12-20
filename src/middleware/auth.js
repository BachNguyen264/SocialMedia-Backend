const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token - user not found'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

module.exports = authMiddleware;