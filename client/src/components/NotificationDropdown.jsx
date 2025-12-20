// /components/NotificationDropdown.jsx
import React from 'react';
import '../pages/home.css';

export default function NotificationDropdown({ notifications }) {
  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">Notifications</div>
      {notifications.length > 0 ? (
        notifications.map((note) => (
          <div key={note.id} className="notification-item">
            {note.message}
          </div>
        ))
      ) : (
        <div className="notification-empty">No new notifications</div>
      )}
    </div>
  );
}
