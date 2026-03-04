import React from 'react';
import './NotificationBadge.css';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  return (
    <div className="notification-badge">
      {count > 0 && <span className="notification-count">{count}</span>}
    </div>
  );
};

export default NotificationBadge; 