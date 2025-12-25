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
  const [dpUrl, setDpUrl] = useState(userProfile?.dp || defaultDp);
  const [notifications, setNotifications] = useState([]);

  // Update profile picture
  useEffect(() => {
    setDpUrl(userProfile?.dp || defaultDp);
  }, [userProfile]);

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotifications);
    return () => unsubscribe();
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
          style={{ cursor: "pointer" }}
        />

        {/* 🔔 Notifications */}
        <div style={{ position: "relative" }}>
          <img
            src={bellIcon}
            alt="Notifications"
            className="icon"
            onClick={() => setIsNotifiVisible(!isNotifiVisible)}
            style={{ cursor: "pointer" }}
          />
          {/* 🔴 Badge */}
          {notifications.length > 0 && (
            <span className="notif-badge">{notifications.length}</span>
          )}
          {isNotifiVisible && (
            <NotificationDropdown notifications={notifications} />
          )}
        </div>

        {/* 👤 Profile image ONLY */}
        <div className="child-profile">
          <img src={dpUrl} alt="Profile" className="profile-img" />
        </div>
      </div>
    </div>
  );
}
