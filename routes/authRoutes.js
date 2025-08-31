import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import User from "../models/userModel.js";
import { v4 as uuidv4 } from 'uuid';
import mongoose from "mongoose";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const dynamicLinks = {
      watchlist: `/share/${uuidv4()}/watchlist`,
      markedAnime: `/share/${uuidv4()}/markedAnime`,
      ongoingAnime: `/share/${uuidv4()}/ongoingAnime`
    };

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      dynamicLinks
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: false, // true in production
      sameSite: 'lax'
    });

    if (req.headers.accept.includes('application/json')) {
      res.status(201).json({ status: 201, message: 'Registration successful' });
    } else {
      res.redirect('/');
    }


  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ status: 500, message: 'Error registering user' });
  }
});


// Route to verify if token is valid
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not logged in' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});


// Login endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: false, // set true in production with HTTPS
      sameSite: 'lax'
    });

    res.json({ status: 200, message: 'Login successful' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    // Generate reset token
    const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn:"1h"});

    // Nodemailer transporter configuration with OAuth
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: 'true',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    const receiver = {
      from: 'Animark@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      http://${req.headers.host}/reset/${token}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    transporter.sendMail(receiver);

    return res.status(200).json({ status: 200, message: 'Password reset link sent' });

  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500).json({ status: 500, message: 'Error sending reset email' });
  }
});

router.post('/resetPassword/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ status: 400, message: 'Please provide the password' });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ email: decode.email });

    const newHashedPassword = await bcrypt.hash(password, 10);

    user.password = newHashedPassword;
    await user.save();

    return res.status(200).json({ status: 200, message: 'Password reset successful' });
  } catch (error) {
    return res.status(500).json({ status: 500, message: 'Something went wrong' });
  }
});

router.get('/check-auth', authMiddleware, (req, res) => {
  res.json({ loggedIn: true });
});

router.post('/logout', (req, res) => {
	res.clearCookie('token');
	res.redirect('/'); // Or send JSON if you're handling logout via JS
});



export default router;