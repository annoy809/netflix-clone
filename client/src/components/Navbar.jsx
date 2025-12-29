import React, { useRef, useEffect, useState } from "react";
import searchIcon from "../img/search_icon.svg";
import bellIcon from "../img/bell_icon.svg";
import defaultDp from "../img/dp.png";
import NotificationDropdown from "./NotificationDropdown";
import { subscribeToNotifications } from "../firebase";
import "./Navbar.css";

export default function Navbar({
  currentBanner,
  userProfile,
  isNotifiVisible,
  setIsNotifiVisible,
  showSearchModal,
  setShowSearchModal,
}) {
  const searchRef = useRef(null);
  const profileRef = useRef(null); // ✅ NEW
  const [dpUrl, setDpUrl] = useState(userProfile?.dp || defaultDp);
  const [notifications, setNotifications] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    setDpUrl(userProfile?.dp || defaultDp);
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotifications);
    return () => unsubscribe();
  }, []);

  // ✅ CLOSE DROPDOWN ON SCROLL OR CLICK OUTSIDE
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    const handleScroll = () => {
      setShowProfile(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // true for capture phase

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  return (
    <div
      className="Navbar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        minHeight: "60px",
        "--navbar-bg": currentBanner?.image
          ? `url(${currentBanner.image})`
          : "none",
      }}
    >
      <p className="logo">FLIXA</p>

      <div className="left-bar" ref={searchRef}>
        {/* 🔍 Search */}
        <img
          src={searchIcon}
          alt="Search"
          className="icon"
          onClick={() => setShowSearchModal(true)}
        />

        {/* 🔔 Notifications */}
        <div style={{ position: "relative" }}>
          <img
            src={bellIcon}
            alt="Notifications"
            className="icon"
            onClick={() => setIsNotifiVisible(!isNotifiVisible)}
          />
          {notifications.length > 0 && (
            <span className="notif-badge">{notifications.length}</span>
          )}
          {isNotifiVisible && (
            <NotificationDropdown notifications={notifications} />
          )}
        </div>

        {/* 👤 Profile */}
        <div className="child-profile" style={{ position: "relative" }} ref={profileRef}>
          <img
            src={dpUrl}
            alt="Profile"
            className="profile-img"
            onClick={() => setShowProfile(!showProfile)}
          />

          {/* 🔽 PROFILE DROPDOWN */}
          {showProfile && (
            <div className="profile-dropdown">
              <p className="pd-name">Masoom</p>
              <p className="pd-role">Full Stack Developer</p>

              <div className="pd-divider" />

              <p>Email: masoomali8076@gmail.com</p>
              <p>
                GitHub:{" "}
                <a
                  href="https://github.com/annoy809"
                  target="_blank"
                  rel="noreferrer"
                  className="profile-link"
                >
                  https://github.com/annoy809
                </a>
              </p>

              <div className="pd-divider" />

              <button
                className="pd-btn"
                onClick={() =>
                  window.open(
                    "https://portfolio-eight-eta-49.vercel.app/",
                    "_blank"
                  )
                }
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
