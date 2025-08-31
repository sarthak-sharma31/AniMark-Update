import express from "express";
import axios from "axios";

const router = express.Router();
const baseURL = "https://api.jikan.moe/v4";

// Endpoint to fetch top 10 anime for homepage
router.get('/top-anime', async (req, res) => {
  try {
    const response = await axios.get(`${baseURL}/top/anime?filter=bypopularity&sfw`);
    const topAnime = response.data.data.slice(0, 20);
    res.json(topAnime);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top anime data' });
  }
});

// Endpoint to search for anime by query
router.get('/search/anime', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }
  try {
    const response = await axios.get(`${baseURL}/anime?q=${query}&sfw`);
    const animeResults = response.data.data;
    res.json(animeResults);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search results' });
  }
});

// Endpoint to fetch detailed information about a specific anime by ID
router.get('/anime/:id', async (req, res) => {
  const animeId = req.params.id;
  try {
    const response = await axios.get(`${baseURL}/anime/${animeId}`);//no sfw works here
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching anime details:', error);
    res.status(500).json({ message: 'Error fetching anime details' });
  }
});

// Endpoint to fetch anime for a specific season
router.get('/season/:year/:season', async (req, res) => {
  const { year, season } = req.params;
  try {
    const response = await axios.get(`${baseURL}/seasons/${year}/${season}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seasonal anime' });
  }
});

// Endpoint to search for anime by genre
router.get('/search/anime/genre/:genre', async (req, res) => {
  const genre = req.params.genre;
  try {
    const response = await axios.get(`${baseURL}/anime?q=${genre}&sfw`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching anime by genre' });
  }
});

router.get('/anime/:id/episodes', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/videos/episodes`);
    res.json(response.data.data);
  } catch (error) {
    console.error('Error fetching anime episodes:', error);
    res.status(500).json({ message: 'Error fetching anime episodes' });
  }
});

router.get('/anime/:id/related', async (req, res) => {
  const animeId = req.params.id;

  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}/recommendations`);//no sfw works here
    res.json(response.data.data);
  } catch (error) {
    console.error('Error fetching related anime:', error);
    res.status(500).json({ message: 'Error fetching related anime' });
  }
});

router.get('/fetchAnime', async (req, res) => {
	const animeId = req.query.id;

	try {
		const response = await axios.get(`https://api.jikan.moe/v4/anime/${animeId}`);//No sfw works here
		const anime = response.data.data;

		res.render('partials/animeCard', { anime }, (err, html) => {
			if (err) {
				console.error("Error rendering animeCard:", err);
				return res.status(500).send("Error loading anime");
			}
			res.send(html);
		});

	} catch (error) {
		console.error(`Error fetching anime ${animeId}:`, error);
		res.status(500).send("Failed to load anime");
	}
});


export default router;
