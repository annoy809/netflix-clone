const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
    );
    res.json(response.data.results);
  } catch (error) {
    console.error('TMDB API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from TMDb' });
  }
});

module.exports = router;
