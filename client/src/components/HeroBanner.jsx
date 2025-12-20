import React, { useEffect, useState } from "react";
import "../pages/home.css";

const TMDB_API_KEY = "80a440824f9a51de8cc051fe109b6e3c";
const SWITCH_TIME = 4000; // 🔥 4 sec fast switch

export default function HeroBanner({ onPlay, onInfoClick }) {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    async function fetchBanner() {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`
        );
        const data = await res.json();

        // only banners with backdrop
        const filtered = data.results.filter(
          (item) => item.backdrop_path
        );

        setBanners(filtered);
      } catch (err) {
        console.error("Banner fetch failed:", err);
      }
    }

    fetchBanner();
  }, []);

  // 🔥 AUTO SWITCH LOGIC
  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, SWITCH_TIME);

    return () => clearInterval(interval);
  }, [banners]);

  if (!banners.length) return null;

  const banner = banners[index];

  // ⚡ FAST IMAGE SIZE
  const background = banner.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${banner.backdrop_path}`
    : "/fallback.jpg";

  const title = banner.title || banner.name || "Untitled";
  const description = banner.overview || "No description available.";
  const year =
    banner.release_date?.split("-")[0] ||
    banner.first_air_date?.split("-")[0] ||
    "N/A";

  const enrichedItem = {
    ...banner,
    id: banner.id,
    media_type: banner.media_type || (banner.name ? "tv" : "movie"),
    season: 1,
    poster: banner.poster_path
      ? `https://image.tmdb.org/t/p/w500${banner.poster_path}`
      : null,
    title,
    description,
  };

  return (
    <div className="container">
      <div
        className="banner-card fade"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="banner-overlay" />

        <div className="banner-content">
          <h1 className="hero-title">{title}</h1>

          <div className="banner-meta">
            <span className="year">{year}</span>
            <span className="tag">HD</span>
            <span className="tag red">Flixa</span>
          </div>

          <p className="description">{description}</p>

          <div className="buttons">
<button
  className="play"
  onClick={() =>
    onPlay({
      ...enrichedItem,
      tvId: enrichedItem.id,
      seasonNumber: 1
    })
  }
>
  ▶ Play
</button>


<button
  className="information"
  onClick={() =>
    onInfoClick({
      ...enrichedItem,
      tvId: enrichedItem.id,     // ✅ MUST
      seasonNumber: 1            // ✅ MUST
    })
  }
>
  ℹ More Info
</button>

          </div>
        </div>
      </div>
    </div>
  );
}
