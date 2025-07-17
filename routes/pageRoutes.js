import express from "express";
import axios from "axios";
import User from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { delay } from '../utils/delay.js';

const router = express.Router();
const baseURL = "http://localhost:3000/api/anime";
const jikanURL = "https://api.jikan.moe/v4/anime";
const jikanTop = "https://api.jikan.moe/v4/top/anime";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//Home Page
router.get('/', async (req, res) => {
	try {
	  // Fetch data for new anime
	  const newAnimeResponse = await axios.get(`https://api.jikan.moe/v4/seasons/now?sfw`);
	  const newAnime = newAnimeResponse.data.data;

	  // Use the first 4 or 5 anime for the slider
	  const sliderData = newAnime.slice(0, 5);

	  // Use the rest for new releases
	  const newReleases = newAnime.slice(5);

	  // Fetch data for popular anime
	  const popularAnimeResponse = await axios.get(`${jikanTop}`);
	  const popularAnime = popularAnimeResponse.data.data;

	  res.render('index', {
		title: 'Welcome to Anime Marking Site!',
		sliderData,
		newReleases,
		popularAnime
	  });
	} catch (error) {
	  console.error('Error fetching data:', error);
	  res.render('index', {
		title: 'Welcome to Anime Marking Site!',
		sliderData: [],
		newReleases: [],
		popularAnime: []
	  });
	}
});

//Anime Details Page
router.get('/anime/:id', authMiddleware, async (req, res) => {
	const animeId = req.params.id;
	const userId = req.user.id;
	try {
		const [animeResponse, userResponse, relatedAnimeResponse] = await Promise.all([
			axios.get(`${jikanURL}/${animeId}`),
			User.findById(userId),
			axios.get(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`)
		  ]);
		const anime = animeResponse.data;

		const isInWatchlist = userResponse.watchlist.includes(animeId);
		const isMarked = userResponse.markedAnime.includes(animeId);

		const ongoingAnime = userResponse.ongoingAnime
		? userResponse.ongoingAnime.find(anime => anime.animeId === animeId)
		: null;
		const completedAnime = userResponse.completedAnime
		? userResponse.completedAnime.find(anime => anime.animeId === animeId)
		: null;
		const lastWatchedEpisode = ongoingAnime
		? ongoingAnime.lastWatchedEpisode
		: (completedAnime ? completedAnime.lastWatchedEpisode : 0);

		const relatedAnime = relatedAnimeResponse.data.data.map(rec => ({
			id: rec.entry.mal_id,
			title: rec.entry.title,
			image: rec.entry.images.jpg.image_url,
			url: rec.entry.url,
			votes: rec.votes
		  }));

		// Render with proper values
		res.render('animeDetails', {
			anime: anime.data,
			isInWatchlist,
			isMarked,
			lastWatchedEpisode,
			relatedAnime
		  });
	} catch (error) {
		console.error('Error fetching anime details:', error.message);
		res.render('animeDetails', {
			title: 'Anime Details',
			anime: null,
			isInWatchlist: false,
			isMarked: false,
			lastWatchedEpisode: 0,
			relatedAnime: [],
		});
	}
});

router.get('/search', async (req, res) => {
	const query = req.query.query;
	try {
	  const response = await axios.get(`${jikanURL}?q=${query}&sfw`);
	  const searchResults = response.data.data;

	  res.render('searchResults', {
		title: 'Search Results',
		searchResults: searchResults,
		query: query
	  });
	} catch (error) {
	  console.error('Error fetching search results:', error);
	  res.render('searchResults', {
		title: 'Search Results',
		searchResults: [],
		query: query
	  });
	}
  });

export default router;