// /components/NotificationDropdown.jsx
import React from "react";
import { formatDistanceToNow } from "date-fns";
import "./NotificationDropdown.css"

export default function NotificationDropdown({ notifications }) {
  return (
    <div className="notification-dropdown">
      <div className="dropdown-header">Notifications</div>
      {notifications.length > 0 ? (
        <div className="notification-list">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`notification-item ${note.read ? "" : "unread"}`}
            >
              <div className="notif-message">{note.message}</div>
              <div className="notif-time">
                {note.createdAt?.toDate
                  ? formatDistanceToNow(note.createdAt.toDate(), {
                      addSuffix: true,
                    })
                  : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="notification-empty">No new notifications</div>
      )}
    </div>
  );
}
