import React, { useState, useEffect } from 'react';
import '../pages/DetailModal.css';
import Player from '../pages/player.jsx';

const DetailModal = ({ item, onClose, tvId, seasonNumber }) => {
  if (!item) return null;

  const [tab, setTab] = useState('episodes');
  const [showPlayer, setShowPlayer] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [videoKey, setVideoKey] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [details, setDetails] = useState(null);
  const [selectedMoreItem, setSelectedMoreItem] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isImdbLoading, setIsImdbLoading] = useState(false);
  const API_KEY = '80a440824f9a51de8cc051fe109b6e3c';

  const isTV = item?.media_type === 'tv' || !!item?.first_air_date || Array.isArray(item?.episode_run_time);

  /* ================= POSTER FIX ================= */
  const posterImage =
    item.poster_path
      ? item.poster_path.startsWith('http')
        ? item.poster_path
        : `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : item.poster && item.poster !== 'N/A'
        ? item.poster
        : 'https://via.placeholder.com/500x750?text=No+Image';

  /* ================= TRAILER ================= */
  useEffect(() => {
    if (!tvId) return;
    const fetchTrailer = async () => {
      try {
        const type = isTV ? 'tv' : 'movie';
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${tvId}/videos?api_key=${API_KEY}`
        );
        const data = await res.json();
        const trailer = data.results?.find(
          v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube'
        );
        setVideoKey(trailer?.key || null);
      } catch (err) {
        console.error('Trailer fetch error:', err);
      }
    };
    fetchTrailer();
  }, [tvId, isTV]);

  /* ================= EPISODES ================= */
  useEffect(() => {
    if (!isTV || !tvId || !selectedSeason) return;
    const fetchEpisodes = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tvId}/season/${selectedSeason}?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        setEpisodes((data.episodes || []).filter(ep => ep.episode_number > 0));
      } catch (err) {
        console.error('Episode fetch error:', err);
      }
    };
    fetchEpisodes();
  }, [tvId, isTV, selectedSeason]);

  /* ================= DETAILS + SIMILAR ================= */
  useEffect(() => {
    if (!tvId) return;
    const fetchData = async () => {
      try {
        const type = isTV ? 'tv' : 'movie';
        const [similarRes, detailsRes] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${type}/${tvId}/similar?api_key=${API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${type}/${tvId}?api_key=${API_KEY}&language=en-US`)
        ]);
        const similarData = await similarRes.json();
        const detailsData = await detailsRes.json();
        setSimilarItems(similarData.results || []);
        setDetails(detailsData);
      } catch (err) {
        console.error('Details fetch error:', err);
      }
    };
    fetchData();
  }, [tvId, isTV]);

  /* ================= IMDb ================= */
  useEffect(() => {
    if (!tvId) return;
    const fetchImdbId = async () => {
      try {
        setIsImdbLoading(true);
        const type = isTV ? 'tv' : 'movie';
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${tvId}/external_ids?api_key=${API_KEY}`
        );
        const data = await res.json();
        if (data.imdb_id) {
          setDetails(prev => prev ? { ...prev, imdbID: data.imdb_id } : { imdbID: data.imdb_id });
        }
      } catch (err) {
        console.error('IMDb fetch error:', err);
      } finally {
        setIsImdbLoading(false);
      }
    };
    fetchImdbId();
  }, [tvId, isTV]);

  /* ================= PLAY ================= */
  const handlePlayClick = async () => {
    let imdbID = details?.imdbID;
    if (!imdbID) {
      try {
        const type = isTV ? 'tv' : 'movie';
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${tvId}/external_ids?api_key=${API_KEY}`
        );
        const data = await res.json();
        imdbID = data.imdb_id || null;
      } catch (err) {
        console.error('IMDb fetch error:', err);
      }
    }
    if (!imdbID) return;

    const payload = isTV
      ? { tmdbID: tvId, imdbID, season: selectedSeason, episode: selectedEpisode, name: item.name || item.title }
      : { tmdbID: tvId, imdbID, name: item.title || item.name };

    setSelectedMoreItem(payload);
    setShowPlayer(true);
  };

  /* ================= MODAL CLOSE HANDLER ================= */
  const handleClose = () => {
    onClose?.();
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  return (
    <div className="detail-modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="detail-modal-container" onClick={e => e.stopPropagation()}>

        {/* Poster */}
        <div className="detail-modal-poster">
          <img
            src={posterImage}
            alt={item.title || item.name}
          />
          <button className="detail-modal-play" onClick={handlePlayClick}>▶</button>
        </div>

        {/* Right Content */}
        <div className="detail-modal-content">
          <button className="detail-modal-close" onClick={handleClose}>×</button>
          <h2>{item.title || item.name}</h2>
          <p>{item.overview || 'No description available.'}</p>

          {/* Tabs */}
          <div className="detail-modal-tabs">
            {(isTV ? ['episodes', 'more', 'details'] : ['more', 'details']).map(tabName => (
              <div
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`detail-modal-tab ${tab === tabName ? 'active' : ''}`}
              >
                {tabName[0].toUpperCase() + tabName.slice(1)}
              </div>
            ))}
          </div>

          {/* Episodes Tab */}
          {isTV && tab === 'episodes' && (
            <div className="detail-modal-episodes">
              <h3>Season {selectedSeason} ({episodes.length} Episodes)</h3>
              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="detail-modal-episode"
                  onClick={() => {
                    setSelectedSeason(selectedSeason);
                    setSelectedEpisode(ep.episode_number);
                    setSelectedMoreItem({ tmdbID: tvId, imdbID: details?.imdbID, season: selectedSeason, episode: ep.episode_number, name: ep.name });
                    setShowPlayer(true);
                  }}
                >
                  <img
                    src={ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : 'https://via.placeholder.com/150x84?text=No+Image'}
                    alt={ep.name}
                  />
                  <div>
                    <strong>Ep {ep.episode_number}: {ep.name}</strong>
                    <p>{ep.overview || 'No description available.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* More Tab */}
          {tab === 'more' && (
            <div className="detail-modal-more">
              <h4>More Like This</h4>
              {similarItems.length > 0 ? (
                <div className="detail-modal-more-grid">
                  {similarItems.slice(0, 6).map(similar => (
                    <div key={similar.id} className="detail-modal-more-item">
                      <img
                        src={similar.poster_path ? `https://image.tmdb.org/t/p/w200${similar.poster_path}` : 'https://via.placeholder.com/100x150?text=No+Image'}
                        alt={similar.title || similar.name}
                      />
                      <p>{similar.title || similar.name}</p>
                    </div>
                  ))}
                </div>
              ) : <p>No similar items found.</p>}
            </div>
          )}

          {/* Details Tab */}
          {tab === 'details' && (
            <div className="detail-modal-details">
              <h4>Details</h4>
              {details ? (
                <>
                  <p><strong>Title:</strong> {details.title || details.name}</p>
                  <p><strong>Release Date:</strong> {details.release_date || details.first_air_date}</p>
                  <p><strong>Language:</strong> {details.original_language?.toUpperCase()}</p>
                  <p><strong>Rating:</strong> {details.vote_average}/10</p>
                  <p><strong>Votes:</strong> {details.vote_count}</p>
                  <p><strong>Genres:</strong> {details.genres?.map(g => g.name).join(', ')}</p>
                  <p><strong>Runtime:</strong> {details.runtime || details.episode_run_time?.[0]} mins</p>
                  <p><strong>Status:</strong> {details.status}</p>
                  <p><strong>Overview:</strong> {details.overview}</p>
                </>
              ) : <p>Loading details...</p>}
            </div>
          )}

          {/* Player */}
          {showPlayer && selectedMoreItem && (
            <div className="detail-modal-player">
              {isImdbLoading ? (
                <p>Loading player...</p>
              ) : (
                <Player
                  selectedMovie={selectedMoreItem}
                  onClose={() => setShowPlayer(false)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
