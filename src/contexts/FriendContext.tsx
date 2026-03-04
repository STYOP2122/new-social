
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import FriendService from '../services/friendService';
import { useAuth } from './AuthContext'; // Import useAuth

interface Friend {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface FriendContextType {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentRequests: string[];
  sendFriendRequest: (friendId: string) => Promise<void>;
  respondToFriendRequest: (requestId: string, accept: boolean, fromUserId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  refreshFriends: () => Promise<void>;
  isLoading: boolean;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const useFriendContext = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error('useFriendContext must be used within a FriendProvider');
  }
  return context;
};

interface FriendProviderProps {
  children: ReactNode;
}

export const FriendProvider: React.FC<FriendProviderProps> = ({ children }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth(); // Use currentUser from AuthContext

  const refreshFriends = async () => {
    setIsLoading(true);
    if (!currentUser) {
      setFriends([]);
      setFriendRequests([]);
      setSentRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      const [userFriends, requests] = await Promise.all([
        FriendService.fetchAllFriends(currentUser.uid),
        FriendService.fetchFriendRequests()
      ]);

      setFriends(userFriends);
      setFriendRequests(requests);

      const sentRequestIds = requests
        .filter((request) => request.fromUserId === currentUser.uid)
        .map((request) => request.toUserId);
      setSentRequests(sentRequestIds);
    } catch (error) {
      console.error("Error refreshing friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshFriends();
  }, [currentUser]); // Depend on currentUser

  const sendFriendRequest = async (friendId: string) => {
    await FriendService.sendFriendRequest(friendId);
    setSentRequests((prev) => [...prev, friendId]);
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean, fromUserId: string) => {
    await FriendService.respondToFriendRequest(requestId, accept, fromUserId);
    await refreshFriends();
  };

  const removeFriend = async (friendId: string) => {
    await FriendService.removeFriend(friendId);
    await refreshFriends();
  };

  const value = {
    friends,
    friendRequests,
    sentRequests,
    sendFriendRequest,
    respondToFriendRequest,
    removeFriend,
    refreshFriends,
    isLoading,
  };

  return <FriendContext.Provider value={value}>{children}</FriendContext.Provider>;
};

export default FriendProvider;
