import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const profileImageMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.dbProfileImage = '/images/anime-characters/default.jpg';
    return next(); // Allow guest users
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request

    const user = await User.findById(decoded.id);
    res.locals.dbProfileImage = user?.profileImage || '/images/anime-characters/default.jpg';
  } catch (error) {
    console.error('Profile image middleware error:', error);
    res.locals.dbProfileImage = '/images/anime-characters/default.jpg';
  }

  next();
};

export default profileImageMiddleware;
