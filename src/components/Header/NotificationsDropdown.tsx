import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import './NotificationsDropdown.css';

const NotificationsDropdown: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [showUnread, setShowUnread] = useState(true);
  const { notifications, respondToFriendRequest } = useNotifications();

  useEffect(() => {
    if (!isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  const toggleShowUnread = () => setShowUnread(true);
  const toggleShowRead = () => setShowUnread(false);

  const handleFriendRequest = async (id: string, accepted: boolean, fromUserId: string) => {
    await respondToFriendRequest(id, accepted, fromUserId);

  };

  const filteredNotifications = showUnread
    ? notifications.filter((notification) => !notification.read)
    : notifications.filter((notification) => notification.read);

  const renderNotificationContent = (notification: any) => {
    switch (notification.type) {
      case 'message':
        return <div>{notification.message}</div>;
      case 'like':
        return (
          <div className="user-notification">
            <img
              src={notification.user?.avatar || 'https://placehold.co/40'}
              alt={notification.user?.name || 'User'}
              className="user-avatar"
            />
            <div className="notifications-user-info">
              <div className="user-name">{notification.user?.name || 'User'}</div>
              <div className="notification-message">{notification.message}</div>
            </div>
          </div>
        );
      case 'friendRequest':
        return (
          <div className="user-notification">
            <img
              src={notification.user?.avatar || 'https://placehold.co/40'}
              alt={notification.user?.name || 'User'}
              className="user-avatar"
            />
            <div className="notifications-user-info">
              <div className="user-name">{notification.user?.name || 'User'}</div>
              <div className="notification-message">{notification.message}</div>
              {notification.status === 'pending' && (
                <div className="friend-request-actions">
                  <button
                    onClick={() => handleFriendRequest(notification.id, true, notification.senderId)}
                    className="friend-request-accept"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendRequest(notification.id, false, notification.senderId)}
                    className="friend-request-decline"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="notifications-dropdown">
      <div className="dropdown-header">
        <button onClick={toggleShowUnread} className={showUnread ? 'active' : ''}>
          Unread
        </button>
        <button onClick={toggleShowRead} className={!showUnread ? 'active' : ''}>
          Read
        </button>
      </div>
      <div className="notification-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className="notification-item">
              {renderNotificationContent(notification)}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            {showUnread ? "You don't have new notifications." : "You don't have any read notifications."}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
