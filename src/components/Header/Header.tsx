
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import './Header.css';
import { ReactComponent as HomeIcon } from '../../assets/home.svg';
import { ReactComponent as GamesIcon } from '../../assets/header-games-icon.svg';
import { ReactComponent as MessagesIcon } from '../../assets/messages.svg';
import { ReactComponent as NotificationsIcon } from '../../assets/notifications.svg';
import { ReactComponent as RecommendationsIcon } from '../../assets/recommendations.svg';
import { ReactComponent as NewPostIcon } from '../../assets/new_post.svg';
import { ReactComponent as ProfileIcon } from '../../assets/profile.svg';
import { ReactComponent as BurgerIcon } from '../../assets/burger.svg';
import NotificationsDropdown from './NotificationsDropdown';
import NotificationBadge from './NotificationBadge';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC = () => {
  const { currentUser } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<'profile' | 'notifications' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadNotificationsRef = useRef<string[]>([]);

  const isActive = (path: string) => location.pathname === path;

  const toggleDropdown = (type: 'profile' | 'notifications') => {
    setOpenDropdown((prev) => {
      if (prev === type) {
        if (type === 'notifications') {
          handleNotificationsClose();
        }
        return null;
      }
      if (type === 'notifications') {
        unreadNotificationsRef.current = notifications.filter(n => !n.read).map(n => n.id);
      }
      return type;
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      if (openDropdown === 'notifications') {
        handleNotificationsClose();
      }
      setOpenDropdown(null);
      setMenuOpen(false);
    }
  };

  const handleNotificationsClose = () => {

    unreadNotificationsRef.current.forEach((id) => markAsRead(id));
    unreadNotificationsRef.current = [];
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header ref={dropdownRef}>
      <div className="header-left">
        <Link to="/">
          <p className="header-title">
            <span>Soft</span>Construct
          </p>
        </Link>
        {currentUser && (
          <input type="text" className="search-bar" placeholder="Search..." />
        )}
      </div>
      <div className="menu-toggle" onClick={() => setMenuOpen((prev) => !prev)}>
        <BurgerIcon className="icon burger-icon" />
      </div>
      <nav className={`menu ${menuOpen ? 'open' : ''}`}>
        {currentUser ? (
          <div className="icon-links">
            <Link to="/" aria-label="Home" className={isActive('/') ? 'link-icon active-icon' : 'link-icon'}>
              <HomeIcon className="icon" />
              <div className='link-title'>Home</div>
            </Link>
            <Link to="/games" aria-label="Games" className={isActive('/games') ? 'link-icon active-icon' : 'link-icon'}>
              <GamesIcon className="icon" />
              <div className='link-title'>Games</div>
            </Link>
            <Link to="/messages" aria-label="Messages" className={isActive('/messages') ? 'link-icon active-icon' : 'link-icon'}>
              <MessagesIcon className="icon" />
              <div className='link-title'>Messages</div>
            </Link>
            <div className="notifications-dropdown-wrapper" onClick={() => toggleDropdown('notifications')}>
              <div
                className="notification-icon-wrapper"
              >
                <NotificationsIcon className="icon" />
                <NotificationBadge count={unreadCount} />
              </div>
              <div className='link-title'>Notifications</div>
              {openDropdown === 'notifications' && (
                <NotificationsDropdown
                  isOpen={openDropdown === 'notifications'}
                  onClose={handleNotificationsClose}
                />
              )}
            </div>
            <Link to="/reels" aria-label="Reels" className={isActive('/reels') ? 'link-icon active-icon' : 'link-icon'}>
              <RecommendationsIcon className="icon" />
              <div className='link-title'>Reels</div>
            </Link>
            <Link to="/new-post" aria-label="New Post" className={isActive('/new-post') ? 'link-icon active-icon' : 'link-icon'}>
              <NewPostIcon className="icon" />
              <div className='link-title'>New Post</div>
            </Link>
            <div className="profile-dropdown-wrapper">
              <span
                aria-label="Profile"
                className="profile-icon"
                onClick={() => toggleDropdown('profile')}
              >
                <ProfileIcon className="icon" />
                <div className='link-title'>Profile</div>
              </span>
              {openDropdown === 'profile' && <ProfileDropdown />}
            </div>
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-links">Login</Link>
            <Link to="/register" className="nav-links">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
