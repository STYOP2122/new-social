import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Registration from './components/Registration/Registration';
import Layout from './components/Layout';
import ForgotPassword from './components/Login/ForgotPassword';
import VerifyEmail from './components/VerifyEmail/VerifyEmail';
import Messages from './components/Messages/Messages';
import NewPost from './components/NewPost/NewPost';
import Reels from './components/Reels/Reels';
import Games from './components/Game/Games';
import Swap from './components/Swap/Swap';
import Profile from './components/Profile/Profile';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FriendProvider } from './contexts/FriendContext';
import { FeedProvider } from './contexts/FeedContext';
import { UserRecommendationsProvider } from './contexts/UserReccomendations';
import { ChatProvider } from './contexts/MessagesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';
import AccountSettings from './components/AccountSettings/AccountSettings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const handleCreatePost = (fileURL: string, caption: string) => {

  };

  const video1 = require('./assets/videos/video1.mp4');
  const video2 = require('./assets/videos/video2.mp4');
  const video3 = require('./assets/videos/video3.mp4');

  const videos = [
    { src: video1, likes: 120, comments: 45, sendcount: 120 },
    { src: video2, likes: 250, comments: 80, sendcount: 200 },
    { src: video3, likes: 300, comments: 150, sendcount: 930 },
  ];

  return (
    <FeedProvider>
      <AuthProvider>
        <FriendProvider>
          <UserRecommendationsProvider>
            <NotificationProvider>
              <ChatProvider>
                <Router>
                  <Routes>
                    {/* Публичные маршруты */}
                    <Route path="/login" element={<Layout hideFooter={false}><Login /></Layout>} /> 
                    <Route path="/register" element={<Layout hideFooter={false}><Registration /></Layout>} />
                    <Route path="/forgot-password" element={<Layout hideFooter={false}><ForgotPassword /></Layout>} />
                    <Route path="/verify-email" element={<Layout hideFooter={false}><VerifyEmail /></Layout>} />

                    {/* Защищенные маршруты */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout hideFooter={false}><Home /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/messages" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}><Messages /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/new-post" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}>
                          <NewPost onCreatePost={handleCreatePost} />
                        </Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/reels" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}><Reels videos={videos} /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/account-settings" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}><AccountSettings /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/games" element={
                      <ProtectedRoute>
                        <Layout hideFooter={false}><Games /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/swap" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}><Swap /></Layout>
                      </ProtectedRoute>
                    } />

                    <Route path="/profile/:uid" element={
                      <ProtectedRoute>
                        <Layout hideFooter={true}><Profile /></Layout>
                      </ProtectedRoute>
                    } />

                    {/* Перенаправление для неизвестных маршрутов */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Router>
              </ChatProvider>
            </NotificationProvider>
          </UserRecommendationsProvider>
        </FriendProvider>
      </AuthProvider>
    </FeedProvider>
  );
};

export default App;