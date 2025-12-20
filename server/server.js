// ✅ Load environment variables
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const axiosRetry = require('axios-retry'); // ✅ Correct import
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour (3600 seconds)
const app = express();
const PORT = process.env.PORT || 3000;


// ✅ Use API key from .env file — don't hardcode!
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.error('❌ TMDB_API_KEY is missing in your .env file');
  process.exit(1);
}

// ✅ Axios instance
const axiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
});

// ✅ Retry logic
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: retryCount => retryCount * 2000,
  retryCondition: error =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || error.code === 'ECONNRESET',
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Health check
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

// ✅ Generic TMDB fetch function
const fetchTMDB = async (endpoint, params = {}, mapper) => {
  try {
    const { data } = await axiosInstance.get(endpoint, {
      params: { api_key: TMDB_API_KEY, ...params },
    });

    return (data.results || [])
      .filter(item => item.backdrop_path || item.poster_path)
      .map(mapper);
  } catch (err) {
    console.error(`❌ TMDB Fetch Error [${endpoint}]:`, err.message);
    throw new Error('Failed to fetch data from TMDB');
  }
};

// ✅ Mapping function
const mapMovie = item => ({
  id: item.id,
  title: item.title || item.name || 'Untitled',
  description: item.overview || 'No description available.',
  image: `https://image.tmdb.org/t/p/original${item.backdrop_path || item.poster_path}`,
  releaseDate: item.release_date || item.first_air_date || 'Unknown',
  rating: item.vote_average ?? 'N/A',
  video: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // 👈 Dummy video
});
async function fetchWithCache(cacheKey, url, res) {
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const { data } = await axios.get(url);
    cache.set(cacheKey, data);
    return res.json(data);
  } catch (err) {
    console.error("TMDB Fetch Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch from TMDB" });
  }
}
// ✅ API routes
const endpoints = [
  // Existing
  { path: '/api/bannerImages', endpoint: '/trending/all/week' },
  { path: '/api/trending', endpoint: '/trending/all/week' },
  { path: '/api/moviePosters', endpoint: '/movie/popular' },
  { path: '/api/recentlyAdded', endpoint: '/movie/now_playing' },
  { path: '/api/kdrama', endpoint: '/discover/tv', params: { with_original_language: 'ko' } },
  { path: '/api/sciFiMovies', endpoint: '/discover/movie', params: { with_genres: '878' } },
  { path: '/api/suspensefulTVShows', endpoint: '/discover/tv', params: { with_genres: '9648' } },
  { path: '/api/animeMovies', endpoint: '/discover/movie', params: { with_genres: '16' } },
  { path: '/api/animeSeries', endpoint: '/discover/tv', params: { with_genres: '16' } },

  // ✅ New Sections
  { path: '/api/topRated', endpoint: '/movie/top_rated' },
  { path: '/api/action', endpoint: '/discover/movie', params: { with_genres: '28' } },
  { path: '/api/romance', endpoint: '/discover/movie', params: { with_genres: '10749' } },
  { path: '/api/horror', endpoint: '/discover/movie', params: { with_genres: '27' } },
  { path: '/api/comedy', endpoint: '/discover/movie', params: { with_genres: '35' } },
  { path: '/api/popularTV', endpoint: '/tv/popular' },
  { path: '/api/documentaries', endpoint: '/discover/movie', params: { with_genres: '99' } },
  { path: '/api/kids', endpoint: '/discover/movie', params: { certification_country: 'US', certification: 'G' } },
  { path: '/api/classics', endpoint: '/discover/movie', params: { 'primary_release_date.lte': '2000-01-01' } },
  { path: '/api/reality', endpoint: '/discover/tv', params: { with_genres: '10764' } }
];


// ✅ Register all routes
endpoints.forEach(({ path, endpoint, params }) => {
  app.get(path, async (req, res) => {
    try {
      const data = await fetchTMDB(endpoint, params, mapMovie);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Upload route
app.use('/api', require('./routes/upload'));

