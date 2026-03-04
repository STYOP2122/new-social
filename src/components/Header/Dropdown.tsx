// src/components/Dropdown.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Dropdown.css';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';  // Импортируем функцию signOut из Firebase
import { auth } from '../../firebaseConfig';


const Dropdown: React.FC = () => {
  const { currentUser } = useAuth();  // Получаем currentUser из контекста

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);  // Выход из Firebase
        window.location.href = '/login';  // Пример редиректа на страницу логина
      } catch (error) {
        console.error("Error during logout: ", error);
      }
    }
  };

  return (
    <div className="dropdown">
      <ul className="dropdown-options">
        <li><Link to="/profile">My Profile</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        <li><a onClick={handleLogout}>Logout</a></li>
      </ul>
    </div>
  );
};

export default Dropdown;