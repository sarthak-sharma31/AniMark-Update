import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id, username }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}