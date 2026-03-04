// src/components/Home/Home.tsx
import React from 'react';
import FriendsList from './FriendsList';
import Feed from './Feed';
import FriendRecommendations from './FriendReccomendations';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="home-container">
      <FriendsList />
      <Feed />
      <FriendRecommendations />
    </div>
  );
};

export default Home;
