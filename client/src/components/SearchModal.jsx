import React, { useState, useEffect } from 'react';
import './SearchModal.css'; // ⬅️ Use this new CSS

const TMDB_API_KEY = '80a440824f9a51de8cc051fe109b6e3c';

export default function SearchModal({ show, setShow, query, setQuery, movies, onSelect }) {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${TMDB_API_KEY}`);
        const data = await res.json();
        const mapped = data.results.map(item => ({
          id: item.id,
          title: item.title || item.name,
          media_type: item.media_type,
          season: 1,
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : 'https://via.placeholder.com/80x120?text=No+Image',
          description: item.overview,
        }));
        setTrending(mapped);
      } catch (err) {
        console.error('Failed to fetch trending:', err);
      }
    };
    fetchTrending();
  }, []);

  useEffect(() => {
  if (show) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  // Cleanup on unmount
  return () => {
    document.body.style.overflow = '';
  };
}, [show]);


  const handleSelect = (e, movie) => {
    e.stopPropagation();
    onSelect(movie);
  };

  if (!show) return null;

  return (
    <div className="search-modal" onClick={() => setShow(false)}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="search-input"
          placeholder="Search titles, genres, people..."
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {movies.length > 0 && (
          <section className="results-section">
            <h3>Search Results</h3>
            <div className="results-grid">
              {movies.map(movie => (
                <div
                  key={movie.imdbID}
                  className="result-card"
                  onClick={(e) =>
                    handleSelect(e, {
                      title: movie.Title,
                      poster: movie.Poster,
                      description: '',
                      id: movie.imdbID,
                      media_type: movie.Type,
                      season: 1,
                    })
                  }
                >
                  <img
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/80x120?text=No+Image'}
                    alt={movie.Title}
                  />
                  <div className="info">
                    <p className="title">{movie.Title}</p>
                    <span className="meta">{movie.Year} • {movie.Type === 'series' ? 'Series' : 'Movie'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="trending-section">
          <h3>Trending Now</h3>
          <div className="results-grid">
            {trending.slice(0, 20).map((movie, idx) => (
              <div
                key={movie.id + idx}
                className="result-card"
                onClick={(e) => handleSelect(e, movie)}
              >
                <img src={movie.poster} alt={movie.title} />
                <div className="info">
                  <p className="title">{movie.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
