import React, {
  useState,
  useEffect,
  lazy,
  useCallback,
  Suspense,
} from "react";
import "./home.css";
import { useNavigate } from "react-router-dom";

import useBannerRotation from "../hooks/useBannerRotation";
import useAuthHandlers from "../hooks/useAuthHandlers";
import { subscribeToNotifications } from "../firebase";

/* ================================
   🚀 Lazy Loaded Components
================================ */
const Navbar = lazy(() => import("../components/Navbar"));
const HeroBanner = lazy(() => import("../components/HeroBanner"));
const SectionList = lazy(() => import("../components/SectionList"));
const SearchModal = lazy(() => import("../components/SearchModal"));
const DetailModal = lazy(() => import("../components/DetailModal"));

/* ================================
   ✨ Smooth Loader
================================ */
const SmoothLoader = () => (
  <div
    style={{
      width: "100%",
      height: "200px",
      background: "linear-gradient(90deg, #222, #333, #222)",
      animation: "pulse 1.4s infinite",
      borderRadius: "8px",
      marginBottom: "20px",
    }}
  />
);

const Home = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tvId, setTvId] = useState(null);
  const [seasonNumber, setSeasonNumber] = useState(1);

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isNotifiVisible, setIsNotifiVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userProfile = useAuthHandlers();
  const navigate = useNavigate();

  /* ================================
     🔔 Notifications
  ================================ */
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotifications);
    return () => unsubscribe();
  }, []);

  /* ================================
     🔍 Debounced Search (OMDB)
  ================================ */
  useEffect(() => {
    if (!query.trim()) {
      setMovies([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=d3b8f193&s=${query}`
        );
        const data = await res.json();
        setMovies(data.Search || []);
      } catch {
        setMovies([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  /* ================================
     🎬 Banner (TMDB Trending)
  ================================ */
  const bannerItems = [];
  const currentBanner = useBannerRotation(bannerItems);

  /* ================================
     🎬 Select Item Handler
  ================================ */
  const handleSelect = useCallback((item) => {
    const enriched = {
      ...item,
      id: item.id,
      media_type: item.media_type || (item.name ? "tv" : "movie"),
      season: 1,
      title: item.title || item.name || "Untitled",
      description: item.overview || "",
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
    };

    setSelectedItem(enriched);
    setTvId(enriched.id);
    setSeasonNumber(1);
  }, []);

  /* ================================
     🚪 Logout
  ================================ */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  return (
    <Suspense fallback={<SmoothLoader />}>
      <div className="home-page">
        {/* Navbar */}
        <Navbar
          currentBanner={currentBanner}
          userProfile={userProfile}
          notifications={notifications}
          isNotifiVisible={isNotifiVisible}
          setIsNotifiVisible={setIsNotifiVisible}
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
          showSearchModal={showSearchModal}
          setShowSearchModal={setShowSearchModal}
          handleLogout={handleLogout}
        />

        {/* Search */}
        <SearchModal
          show={showSearchModal}
          setShow={setShowSearchModal}
          query={query}
          setQuery={setQuery}
          movies={movies}
          onSelect={handleSelect}
        />

        {/* Hero Banner */}
<HeroBanner
  onPlay={(data) => handleSelect(data)}
  onInfoClick={(data) => handleSelect(data)}
/>


        {/* ================================
            🎞️ TMDB Sections
        ================================ */}
        <SectionList title="Trending Now" endpoint="/trending/all/week" onSelect={handleSelect} />
        <SectionList title="Top Rated Movies" endpoint="/movie/top_rated" onSelect={handleSelect} />
        <SectionList title="Recently Added" endpoint="/movie/now_playing" onSelect={handleSelect} />
        <SectionList title="Popular TV Shows" endpoint="/tv/popular" onSelect={handleSelect} />
<SectionList title="Action Thrillers" endpoint="/discover/movie?with_genres=28" onSelect={handleSelect} />
<SectionList title="Romantic Comedies" endpoint="/discover/movie?with_genres=35,10749" onSelect={handleSelect} />
<SectionList title="Horror Picks" endpoint="/discover/movie?with_genres=27" onSelect={handleSelect} />
<SectionList title="Sci-Fi Adventures" endpoint="/discover/movie?with_genres=878" onSelect={handleSelect} />

<SectionList title="Anime Movies" endpoint="/discover/movie?with_genres=16" onSelect={handleSelect} />
<SectionList title="Anime Series" endpoint="/discover/tv?with_genres=16" onSelect={handleSelect} />

<SectionList title="Documentaries" endpoint="/discover/movie?with_genres=99" onSelect={handleSelect} />
<SectionList title="K-Drama" endpoint="/discover/tv?with_original_language=ko" onSelect={handleSelect} />
<SectionList title="Family & Kids" endpoint="/discover/movie?with_genres=10751" onSelect={handleSelect} />
<SectionList title="Reality Shows" endpoint="/discover/tv?with_genres=10764" onSelect={handleSelect} />


        {/* Detail Modal */}
        {selectedItem && (
          <DetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            tvId={tvId}
            seasonNumber={seasonNumber}
          />
        )}
      </div>
    </Suspense>
  );
};

export default React.memo(Home);
