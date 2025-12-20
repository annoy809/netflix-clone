import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../pages/SectionList.css";

/* ===============================
   TMDB CONFIG
================================ */
const TMDB_API_KEY = "80a440824f9a51de8cc051fe109b6e3c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/* ===============================
   🎬 MOVIE CARD (FIXED)
================================ */
const MovieCard = React.memo(function MovieCard({ item, onSelect }) {
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "/fallback.jpg";

  const title = item.title || item.name || "Untitled";

  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <div
      className="movie-thumb optimized-thumb"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
<img
  src={poster}
  alt={title}
  loading="lazy"
  decoding="async"
  className="movie-img"
  onLoad={(e) => e.currentTarget.classList.add("img-loaded")}
  onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
/>


      <div className="overlay">
        <div className="overlay-title">{title}</div>
      </div>
    </div>
  );
});

/* ===============================
   📺 SECTION LIST
================================ */
export default function SectionList({ title, endpoint, onSelect }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const url = `${TMDB_BASE_URL}${endpoint}${separator}api_key=${TMDB_API_KEY}&language=en-US`;

        const res = await fetch(url);
        const data = await res.json();

        if (mounted) setItems(data.results || []);
      } catch (err) {
        console.error("TMDB Fetch Error:", err);
      }
    }

    fetchData();
    return () => (mounted = false);
  }, [endpoint]);

  const memoizedItems = useMemo(() => items, [items]);

  const handleSelect = useCallback(
    (item) => {
      onSelect({
        ...item,
        id: item.id,
        media_type: item.media_type || (item.name ? "tv" : "movie"),
        season: 1,
        title: item.title || item.name,
        description: item.overview || "",
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : null,
      });
    },
    [onSelect]
  );

  if (!memoizedItems.length) return null;

  return (
    <div className="section">
      <h2 className="section-title">{title}</h2>

      <div className="movie-row optimized-row">
        {memoizedItems.map((item) => (
          <MovieCard
            key={item.id}
            item={item}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
