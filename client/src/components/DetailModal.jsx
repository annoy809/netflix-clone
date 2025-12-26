import React, { useState, useEffect } from "react";
import "../pages/DetailModal.css";
import Player from "../pages/player.jsx";

const DetailModal = ({ item, onClose, tvId, seasonNumber }) => {
  if (!item) return null;

  const [tab, setTab] = useState("episodes");
  const [showPlayer, setShowPlayer] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [similarItems, setSimilarItems] = useState([]);
  const [details, setDetails] = useState(null);
  const [selectedMoreItem, setSelectedMoreItem] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber || 1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isImdbLoading, setIsImdbLoading] = useState(false);

  const API_KEY = "80a440824f9a51de8cc051fe109b6e3c";

  const isTV =
    item?.media_type === "tv" ||
    !!item?.first_air_date ||
    Array.isArray(item?.episode_run_time);

  /* ================= POSTER ================= */
  const posterImage = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  /* ================= SEASONS ================= */
  useEffect(() => {
    if (!isTV || !tvId) return;

    const fetchSeasons = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tvId}?api_key=${API_KEY}`
        );
        const data = await res.json();
        setSeasons((data.seasons || []).filter(s => s.season_number > 0));
      } catch (e) {
        console.error(e);
      }
    };

    fetchSeasons();
  }, [tvId, isTV]);

  /* ================= EPISODES ================= */
  useEffect(() => {
    if (!isTV || !tvId || !selectedSeason) return;

    const fetchEpisodes = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tvId}/season/${selectedSeason}?api_key=${API_KEY}`
        );
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (e) {
        console.error(e);
      }
    };

    fetchEpisodes();
  }, [tvId, isTV, selectedSeason]);

  /* ================= DETAILS + SIMILAR ================= */
  useEffect(() => {
    if (!tvId) return;

    const fetchData = async () => {
      const type = isTV ? "tv" : "movie";
      const [d, s] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/${type}/${tvId}?api_key=${API_KEY}`
        ),
        fetch(
          `https://api.themoviedb.org/3/${type}/${tvId}/similar?api_key=${API_KEY}`
        ),
      ]);

      setDetails(await d.json());
      setSimilarItems((await s.json()).results || []);
    };

    fetchData();
  }, [tvId, isTV]);

  /* ================= IMDb ================= */
  useEffect(() => {
    if (!tvId) return;

    const fetchImdb = async () => {
      setIsImdbLoading(true);
      const type = isTV ? "tv" : "movie";
      const res = await fetch(
        `https://api.themoviedb.org/3/${type}/${tvId}/external_ids?api_key=${API_KEY}`
      );
      const data = await res.json();
      setDetails(prev => ({ ...prev, imdbID: data.imdb_id }));
      setIsImdbLoading(false);
    };

    fetchImdb();
  }, [tvId, isTV]);

  /* ================= PLAY ================= */
  const playEpisode = (ep) => {
    setSelectedEpisode(ep.episode_number);
    setSelectedMoreItem({
      tmdbID: tvId,
      imdbID: details?.imdbID,
      season: selectedSeason,
      episode: ep.episode_number,
      name: ep.name,
    });
    setShowPlayer(true);
  };

  /* ================= CLOSE ================= */
  const handleClose = () => {
    onClose?.();
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  return (
    <div className="detail-modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="detail-modal-container">

        {/* Poster */}
        <div className="detail-modal-poster">
          <img src={posterImage} alt="" />
          <button className="detail-modal-play" onClick={() => setShowPlayer(true)}>▶</button>
        </div>

        {/* Content */}
        <div className="detail-modal-content">
          <button className="detail-modal-close" onClick={handleClose}>×</button>
          <h2>{item.title || item.name}</h2>
          <p>{item.overview}</p>

          {/* Tabs */}
          <div className="detail-modal-tabs">
            {(isTV ? ["episodes", "more", "details"] : ["more", "details"]).map(t => (
              <div
                key={t}
                className={`detail-modal-tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}
              </div>
            ))}
          </div>

          {/* Episodes */}
          {isTV && tab === "episodes" && (
            <div className="detail-modal-episodes">

              {/* Season Selector */}
              <div className="season-selector">
                <select
                  value={selectedSeason}
                  onChange={e => setSelectedSeason(Number(e.target.value))}
                >
                  {seasons.map(s => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
              </div>

              {episodes.map(ep => (
                <div
                  key={ep.id}
                  className="detail-modal-episode"
                  onClick={() => playEpisode(ep)}
                >
                  <img
                    src={
                      ep.still_path
                        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                        : "https://via.placeholder.com/150x84"
                    }
                    alt=""
                  />
                  <div>
                    <strong>
                      Ep {ep.episode_number}: {ep.name}
                    </strong>
                    <p>{ep.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Player */}
          {showPlayer && selectedMoreItem && (
            <div className="detail-modal-player">
              {isImdbLoading ? (
                <p>Loading...</p>
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
