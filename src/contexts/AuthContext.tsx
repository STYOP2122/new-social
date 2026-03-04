// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../firebaseConfig';
import { onAuthStateChanged, User, reload } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FriendProvider } from './FriendContext';
import { UserRecommendationsProvider } from './UserReccomendations';
import { FeedProvider } from './FeedContext';

interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

interface AuthContextType {
  currentUser: (User & UserProfile) | null;
  loading: boolean;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  loading: true,
  reloadUser: async () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(User & UserProfile) | null>(null);
  const [loading, setLoading] = useState(true);

  const reloadUser = async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      const user = auth.currentUser;
      await handleUserUpdate(user);
    }
  };

  const handleUserUpdate = async (user: User | null) => {
    if (user && user.emailVerified) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setCurrentUser({
          ...user,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUrl: userData.avatarUrl,
        });
      } else {
        setCurrentUser({
          ...user,
          firstName: '',
          lastName: '',
          avatarUrl: '',
        });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await handleUserUpdate(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, reloadUser }}>
      <FeedProvider>
        <FriendProvider>
          <UserRecommendationsProvider>
            {children}
          </UserRecommendationsProvider>
        </FriendProvider>
      </FeedProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};