import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbProfileImage = '/images/anime-characters/zoro.jpg';

const router = express.Router();

router.get('/profile', authMiddleware, async (req, res) => {
	const userId = req.user.id;
	try {
	  const user = await User.findById(userId);
	  const imagesDir = path.join(__dirname, '../public/images/anime-characters');
	  const images = fs.readdirSync(imagesDir);
	  res.render('profile', { user, images, dbProfileImage: user.profileImage || '/images/anime-characters/zoro.jpg' });
	} catch (error) {
	  console.error('Error fetching profile:', error);
	  res.status(500).json({ message: 'Error fetching profile' });
	}
});

router.post('/update-profile-photo', authMiddleware, async (req, res) => {
	const { profileImage } = req.body;
	const userId = req.user.id;

	try {
	  const user = await User.findById(userId);
	  user.profileImage = profileImage;
	  await user.save();
	  dbProfileImage = profileImage; // Update global variable
	  res.redirect('/profile');
	} catch (error) {
	  console.error('Error updating profile photo:', error);
	  res.status(500).json({ message: 'Error updating profile photo' });
	}
});

// Update Profile
router.put('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Change Password
router.put('/profile/password', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

export default router;