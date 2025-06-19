import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";
import mongoose from "mongoose"; // Don't forget this if not imported yet
import axios from "axios";

const router = express.Router();

router.post('/share/static', authMiddleware, async (req, res) => {
	const { snapshotName, expiration, listType } = req.body;
	const userId = req.user.id; // Now req.user is defined ✅

	try {
	  const user = await User.findById(userId);
	  if (!user || !user[listType]) {
		return res.status(404).json({ message: 'List not found.' });
	  }

	  const animeIds = user[listType];
	  const staticLinkId = new mongoose.Types.ObjectId(); // Unique ID for the static link
	  const expirationDate = expiration === 'permanent' ? null : new Date(Date.now() + expiration * 24 * 60 * 60 * 1000);

	  const staticLink = {
		id: staticLinkId,
		type: 'static',
		listType,
		animeIds,
		createdAt: new Date(),
		expiration: expirationDate,
		snapshotName: snapshotName || `${listType} Snapshot`
	  };

	  user.sharedLinks.push(staticLink);
	  await user.save();

	  const shareLink = `/shared/static/${staticLinkId}`;
	  res.json({ shareLink });
	} catch (error) {
	  console.error('Error creating static link:', error);
	  res.status(500).json({ message: 'Error creating static link.' });
	}
});


router.get('/shared/static/:linkId', authMiddleware, async (req, res) => {
	const { linkId } = req.params;

	try {
		// Find the static link
		const user = await User.findOne({ 'sharedLinks.id': linkId });
		const staticLink = user ? user.sharedLinks.find(link => link.id === linkId) : null;

		if (!staticLink) {
			return res.status(404).json({ message: 'Link not found.' });
		}

		// Check if the link is expired
		if (staticLink.expiration && new Date() > staticLink.expiration) {
			return res.status(410).json({ message: 'This link has expired.' });
		}

		// ✅ Just pass the animeIds and title to EJS
		res.render('sharedAnimeList', {
			title: staticLink.snapshotName,
			animeList: [], // Not used anymore
			animeIds: staticLink.animeIds
		});
	} catch (error) {
		console.error('Error fetching static link:', error);
		res.status(500).json({ message: 'Error fetching static link.' });
	}
});


router.get('/share/:linkId/:listType', authMiddleware, async (req, res) => {
	const { linkId, listType } = req.params;

	try {
		// Find the user with matching dynamic link
		const user = await User.findOne({
			$or: [
				{ 'dynamicLinks.watchlist': `/share/${linkId}/watchlist` },
				{ 'dynamicLinks.markedAnime': `/share/${linkId}/markedAnime` },
				{ 'dynamicLinks.ongoingAnime': `/share/${linkId}/ongoingAnime` }
			]
		});

		// Validate user and list
		if (!user || !user[listType]) {
			return res.status(404).json({ message: 'List not found.' });
		}

		// ✅ Pass only anime IDs, let frontend handle fetching
		res.render('sharedAnimeList', {
			title: `${listType} - Dynamic List`,
			animeList: [], // no server-side anime data
			animeIds: user[listType]
		});
	} catch (error) {
		console.error('Error fetching dynamic list:', error);
		res.status(500).json({ message: 'Error fetching dynamic list.' });
	}
});



export default router;