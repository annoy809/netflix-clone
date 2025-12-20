const axios = require('axios');
const express = require('express');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/api/bannerImages', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
    );

    const banners = response.data.results.slice(0, 30).map((item) => ({
      image: `https://image.tmdb.org/t/p/original${item.backdrop_path}`,
      title: item.title || item.name,
      description: item.overview,
      video: `https://www.youtube.com/embed/${item.id}`, // optional/fake, replace if needed
    }));

    res.json(banners);
  } catch (error) {
    console.error('Error fetching banner images:', error);
    res.status(500).json({ error: 'Failed to fetch banner images' });
  }
});

module.exports = router;
