import express from "express";
import axios from "axios";
import User from "../models/userModel.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const baseURL = "https://api.jikan.moe/v4";

// Add to Watchlist
router.post('/watchlist', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { animeId } = req.body;

  try {
    console.log('Cookie userId:', req.cookies.userId);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.watchlist.includes(animeId)) {
      user.watchlist.push(animeId); // Store anime ID as string
      await user.save();
    }

    res.json({ message: 'Anime added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding anime to watchlist' });
  }
});

// View Watchlist
router.get('/watchlist', authMiddleware, async (req, res) => {
	const userId = req.user.id;

	try {
		const user = await User.findById(userId).select('watchlist dynamicLinks');

		if (!user || !user.watchlist || user.watchlist.length === 0) {
			return res.render('watchlist', {
				title: "Watchlist",
				animeList: [],
				watchlistIds: [],
				dynamicLink: null // No link to show
			});
		}

		const watchlistIds = user.watchlist;
		const dynamicLink = user.dynamicLinks?.watchlist || null;

		res.render('watchlist', {
			title: "Watchlist",
			animeList: [],
			watchlistIds,
			dynamicLink
		});
	} catch (error) {
		console.error('Error fetching watchlist:', error);
		res.render('watchlist', {
			title: "Watchlist",
			animeList: [],
			watchlistIds: [],
			dynamicLink: null
		});
	}
});




// Remove from Watchlist
router.delete('/watchlist', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { animeId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { watchlist: animeId } }, // Remove anime ID from watchlist
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Anime removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing anime from watchlist' });
  }
});

export default router;
