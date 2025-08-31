import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/userModel.js";
import mongoose from 'mongoose'; // ✅ make sure you have this at the top

const router = express.Router();

// Serve the manage links dashboard
router.get('/manage-links', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('sharedLinks');

        res.render('manageLinks', {
            title: 'Manage Shared Links',
            sharedLinks: user.sharedLinks
        });
    } catch (error) {
        console.error('Error fetching shared links:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Increase expiration by 1 day
router.put('/shared-links/increase-expiration/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        console.log('Received request to increase expiration for link ID:', id);
        console.log('Fetching user with ID:', userId);

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user);

        const link = user.sharedLinks.find(link => link.id === id);
        console.log('Found link:', link);

        if (!link || !link.expiration) {
            console.log('Link not found or does not have expiration');
            return res.status(404).json({ message: 'Link not found or does not have an expiration date' });
        }

        link.expiration = new Date(new Date(link.expiration).getTime() + 24 * 60 * 60 * 1000);
        await user.save();

        console.log('Expiration successfully extended.');
        res.status(200).json({ message: 'Expiration extended' });
    } catch (error) {
        console.error('Error updating expiration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Decrease expiration by 1 day
router.put('/shared-links/decrease-expiration/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const user = await User.findById(userId);
        const linkIndex = user.sharedLinks.findIndex(link => link.id === id);

        if (linkIndex === -1 || !user.sharedLinks[linkIndex].expiration) {
            return res.status(404).json({ message: 'Link not found or does not have an expiration date' });
        }

        const link = user.sharedLinks[linkIndex];

        // Decrease expiration by 1 day
        link.expiration = new Date(new Date(link.expiration).getTime() - 24 * 60 * 60 * 1000);

        // If the new expiration is now in the past, delete the link
        if (link.expiration < new Date()) {
            user.sharedLinks.splice(linkIndex, 1); // Remove the link
            await user.save();
            return res.status(410).json({ message: 'Link expired and has been deleted.' });
        }

        await user.save();
        res.status(200).json({ message: 'Expiration reduced' });
    } catch (error) {
        console.error('Error updating expiration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete a shared link
router.delete('/shared-links/delete/:id', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const user = await User.findById(userId);

        const exists = user.sharedLinks.some(link => link.id === id);
        if (!exists) {
            return res.status(404).json({ message: 'Link not found' });
        }

        user.sharedLinks = user.sharedLinks.filter(link => link.id !== id);
        await user.save();

        res.status(200).json({ message: 'Link deleted' });
    } catch (error) {
        console.error('Error deleting link:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




export default router;
