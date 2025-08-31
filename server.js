import jwt from 'jsonwebtoken';
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import session from "express-session";

import pageRoutes from "./routes/pageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sharedLinkRoutes from "./routes/sharedLinks.js";
import shareRoutes from "./routes/shareRoutes.js";
import animeRoutes from "./routes/animeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import watchlistRoutes from "./routes/watchlistRoutes.js";
import markedAnimeRoutes from "./routes/markedAnimeRoutes.js";
import ongoingAnimeRoutes from "./routes/ongoingAnimeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

import passport from './config/passportConfig.js';
import profileImageMiddleware from './middleware/profileImageMiddleware.js';
import jwtMiddleware from "./middleware/jwtMiddleware.js";
import attachUser from "./middleware/attachUser.js";
import User from "./models/userModel.js";

dotenv.config();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session and Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Attach decoded JWT user to req.user
app.use(jwtMiddleware);
app.use(attachUser);
app.use(profileImageMiddleware);

//// Routes
app.use('/', pageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/user', watchlistRoutes);
app.use('/api/user', markedAnimeRoutes);
app.use('/api/user', ongoingAnimeRoutes);
app.use('/category', categoryRoutes);
app.use('/', profileRoutes);
app.use('/api', commentRoutes);
app.use('/', sharedLinkRoutes);
app.use('/', shareRoutes);

// Root route
app.get('/', (req, res) => {
  res.render('index', { title: 'Welcome to Anime Marking Site!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Server listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
