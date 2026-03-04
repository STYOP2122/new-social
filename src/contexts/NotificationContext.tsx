
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { firestore } from '../firebaseConfig';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import FriendService from '../services/friendService';

interface Notification {
  id: string;
  type: 'message' | 'like' | 'friendRequest';
  senderId: string;
  recipientId: string;
  message?: string;
  read: boolean;
  createdAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
}

interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface NotificationContextType {
  notifications: Notification[];
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  friendRequests: FriendRequest[];
  respondToFriendRequest: (requestId: string, accept: boolean, fromUserId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const notificationsRef = collection(firestore, 'notifications');
    const notificationsQuery = query(notificationsRef, where('recipientId', '==', currentUser.uid));

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Notification[];
      
      setNotifications(newNotifications);
    });

    const friendRequestsRef = collection(firestore, 'friendRequests');
    const friendRequestsQuery = query(friendRequestsRef, where('toUserId', '==', currentUser.uid), where('status', '==', 'pending'));

    const unsubscribeFriendRequests = onSnapshot(friendRequestsQuery, (snapshot) => {
      const newFriendRequests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FriendRequest[];
      
      setFriendRequests(newFriendRequests);
    });

    const sentFriendRequestsQuery = query(friendRequestsRef, where('fromUserId', '==', currentUser.uid), where('status', '==', 'accepted'));

    const unsubscribeSentFriendRequests = onSnapshot(sentFriendRequestsQuery, async (snapshot) => {
      const acceptedRequests = snapshot.docs.filter(doc => doc.data().status === 'accepted');
      
      for (const acceptedRequest of acceptedRequests) {
        const data = acceptedRequest.data() as FriendRequest;
        await createNotification({
          type: 'friendRequest',
          senderId: data.toUserId,
          recipientId: currentUser.uid,
          message: 'accepted your friend request',
          user: {
            name: 'User', // You might want to fetch the actual user name here
            avatar: '', // You might want to fetch the actual user avatar here
          },
        });
        
        // Update the request status to prevent duplicate notifications
        await updateDoc(doc(friendRequestsRef, acceptedRequest.id), { status: 'notified' });
      }
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeFriendRequests();
      unsubscribeSentFriendRequests();
    };
  }, [currentUser]);

  const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      await addDoc(collection(firestore, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean, fromUserId: string) => {
    await FriendService.respondToFriendRequest(requestId, accept, fromUserId);
    
    const responseNotification: Omit<Notification, 'id' | 'createdAt' | 'read'> = {
      type: 'friendRequest',
      senderId: currentUser!.uid,
      recipientId: fromUserId,
      message: accept ? 'accepted your friend request' : 'declined your friend request',
      user: {
        name: currentUser!.displayName || 'User',
        avatar: currentUser!.photoURL || '',
      },
    };
    await createNotification(responseNotification);
  };

  return (
    <NotificationContext.Provider value={{ notifications, createNotification, markAsRead, friendRequests, respondToFriendRequest }}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
