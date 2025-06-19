import express from "express";
import axios from "axios";
import { delay } from '../utils/delay.js';

const router = express.Router();
const baseURL = "https://api.jikan.moe/v4";
const jikanTop = "https://api.jikan.moe/v4/top/anime";

router.get('/new', async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1;

        await delay(1500);

        const response = await axios.get(`https://api.jikan.moe/v4/seasons/now?page=${page}&sfw`);
        let paginatedAnime = response.data.data;

        if (req.query.page) {
            return res.render('partials/animeCardList', { animeList: paginatedAnime });
        }

        res.render('category', { title: 'New Anime', animeList: paginatedAnime });
    } catch (error) {
        console.error("Error fetching paginated anime:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/top', async (req, res) => {
    try {
      const response = await axios.get(`${jikanTop}?sfw`);
      res.render('category', { title: 'Top Anime', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching Top Anime:', error);
      res.render('index', { title: 'Top Anime', animeList: [] });
    }
});

router.get('/movies', async (req, res) => {
    try {

      await delay(2000); // Add a 2-second delay before making the API call

      const response = await axios.get(`${jikanTop}?type=movie`);
      let paginatedAnime = response.data.data;

      if (req.query.page) {
          return res.render('partials/animeCardList', { animeList: paginatedAnime });
      }

      res.render('category', { title: 'Movies', animeList: paginatedAnime });
  } catch (error) {
      console.error("Error fetching paginated anime:", error);
      res.status(500).send("Server Error");
  }
});

router.get('/ova', async (req, res) => {
    try {
      const response = await axios.get(`${jikanTop}?type=ova`);
      res.render('category', { title: 'OVA', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime movies:', error);
      res.render('index', { title: 'OVA', animeList: [] });
    }
});

router.get('/ona', async (req, res) => {
    try {
      const response = await axios.get(`${jikanTop}?type=ona`);
      res.render('category', { title: 'ONA', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime movies:', error);
      res.render('index', { title: 'ONA', animeList: [] });
    }
});

router.get('/upcoming', async (req, res) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/seasons/upcoming`);
      res.render('category', { title: 'Upcoming Anime', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime movies:', error);
      res.render('index', { title: 'Upcoming Anime', animeList: [] });
    }
});

router.get('/summer', async (req, res) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/seasons/2024/summer?sfw`);
      res.render('category', { title: 'Summer Anime', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime:', error);
      res.render('index', { title: 'Summer Anime', animeList: [] });
    }
});

router.get('/winter', async (req, res) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/seasons/2024/winter?sfw`);
      res.render('category', { title: 'Winter Anime', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime:', error);
      res.render('index', { title: 'Winter Anime', animeList: [] });
    }
});

router.get('/spring', async (req, res) => {
    try {
      const response = await axios.get(`https://api.jikan.moe/v4/seasons/2024/spring?sfw`);
      res.render('category', { title: 'Spring Anime', animeList: response.data.data });
    } catch (error) {
      console.error('Error fetching anime:', error);
      res.render('index', { title: 'Spring Anime', animeList: [] });
    }
});

export default router;