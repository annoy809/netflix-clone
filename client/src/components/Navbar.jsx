// /components/Navbar.jsx
import React, { useRef, useEffect, useState } from 'react';
import searchIcon from '../img/search_icon.svg';
import bellIcon from '../img/bell_icon.svg';
import defaultDp from '../img/dp.png';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

export default function Navbar({
  currentBanner,
  userProfile,
  notifications,
  isNotifiVisible,
  setIsNotifiVisible,
  showSearchModal,
  setShowSearchModal,
}) {
  const searchRef = useRef(null);
  const [dpUrl, setDpUrl] = useState(userProfile?.dp || defaultDp);

  useEffect(() => {
    setDpUrl(userProfile?.dp || defaultDp);
  }, [userProfile]);

  return (
    <div
      className="Navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        minHeight: '60px',
        '--navbar-bg': currentBanner?.image
          ? `url(${currentBanner.image})`
          : 'none',
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
          style={{ cursor: 'pointer' }}
        />

        {/* 🔔 Notifications (UNCHANGED) */}
        <img
          src={bellIcon}
          alt="Notifications"
          className="icon"
          onClick={() => setIsNotifiVisible(!isNotifiVisible)}
          style={{ cursor: 'pointer' }}
        />

        {isNotifiVisible && (
          <NotificationDropdown notifications={notifications} />
        )}

        {/* 👤 Profile image ONLY (no dropdown) */}
        <div className="child-profile">
          <img
            src={dpUrl}
            alt="Profile"
            className="profile-img"
          />
        </div>
      </div>
    </div>
  );
}
