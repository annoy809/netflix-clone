import { useEffect, useState } from "react";
import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export default function useBannerData() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await axios.get(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`);
        const item = res.data.results[Math.floor(Math.random() * res.data.results.length)];

        const details = await axios.get(`${BASE_URL}/${item.media_type}/${item.id}?api_key=${API_KEY}&append_to_response=videos`);

        setBanner({
          title: details.data.title || details.data.name,
          description: details.data.overview,
          image: `https://image.tmdb.org/t/p/original${details.data.backdrop_path}`,
          poster: `https://image.tmdb.org/t/p/w500${details.data.poster_path}`,
          video: extractYoutubeTrailer(details.data.videos.results),
          year: (details.data.release_date || details.data.first_air_date || "").slice(0, 4),
          episodes: [
            { number: 1, title: "Episode 1", description: "This is a sample episode." },
            { number: 2, title: "Episode 2", description: "Another sample episode." },
          ]
          
        });
      } catch (err) {
        console.error("Failed to fetch TMDB banner:", err);
      }
    }

    fetchBanner();
  }, []);

  return banner;
}

function extractYoutubeTrailer(videos) {
  const trailer = videos.find(v => v.type === "Trailer" && v.site === "YouTube");
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

