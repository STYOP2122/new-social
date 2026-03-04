import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { useFriendContext } from './FriendContext';
import { useAuth } from './AuthContext'; // Import useAuth

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

interface UserRecommendationsContextType {
  recommendedUsers: User[];
  isLoading: boolean;
  refreshRecommendations: () => Promise<void>;
}

const UserRecommendationsContext = createContext<UserRecommendationsContextType | undefined>(undefined);

export const useUserRecommendations = () => {
  const context = useContext(UserRecommendationsContext);
  if (!context) {
    throw new Error('useUserRecommendations must be used within a UserRecommendationsProvider');
  }
  return context;
};

interface UserRecommendationsProviderProps {
  children: ReactNode;
}

export const UserRecommendationsProvider: React.FC<UserRecommendationsProviderProps> = ({ children }) => {
  const [recommendedUsers, setRecommendedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { friends } = useFriendContext();
  const { currentUser } = useAuth(); // Use currentUser from AuthContext

  const refreshRecommendations = async () => {
    setIsLoading(true);
    if (!currentUser) {
      setRecommendedUsers([]);
      setIsLoading(false);
      return;
    }

    try {
      const usersCollection = collection(firestore, 'users');
      const q = query(usersCollection, limit(10)); // Fetch 10 random users
      const querySnapshot = await getDocs(q);

      const users = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => 
          user.id !== currentUser.uid && 
          !friends.some(friend => friend.id === user.id)
        );

      setRecommendedUsers(users);
    } catch (error) {
      console.error("Error fetching recommended users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRecommendations();
  }, [currentUser, friends]); // Depend on currentUser and friends

  const value = {
    recommendedUsers,
    isLoading,
    refreshRecommendations,
  };

  return <UserRecommendationsContext.Provider value={value}>{children}</UserRecommendationsContext.Provider>;
};

export default UserRecommendationsProvider;