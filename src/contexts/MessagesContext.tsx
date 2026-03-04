import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { collection, doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig";

type Message = {
  id: string;
  text: string;
  createdAt: Date;
  senderId: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  isOnline: boolean;
};

type ChatContextType = {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
};

export const ChatContext = createContext<ChatContextType>({
  users: [],
  selectedUser: null,
  setSelectedUser: () => {},
  messages: [],
  sendMessage: async () => {},
});

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as User))
        .filter((user) => user.id !== auth.currentUser?.uid);
      setUsers(usersData);
    });

    return () => unsubscribeUsers();
  }, []);

  useEffect(() => {
    if (selectedUser && auth.currentUser) {
      const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
      const chatRef = doc(firestore, "chats", chatId);

      const unsubscribeMessages = onSnapshot(chatRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data();
          setMessages(chatData.messages || []);
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribeMessages();
    }
  }, [selectedUser]);

  const sendMessage = async (text: string) => {
    if (!selectedUser || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, selectedUser.id].sort().join('_');
    const chatRef = doc(firestore, "chats", chatId);

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      createdAt: new Date(),
      senderId: auth.currentUser.uid,
    };

    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      await updateDoc(chatRef, {
        messages: arrayUnion(newMessage),
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      });
    } else {
      await setDoc(chatRef, {
        participants: [auth.currentUser.uid, selectedUser.id],
        messages: [newMessage],
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
      });
    }
  };

  return (
    <ChatContext.Provider value={{ users, selectedUser, setSelectedUser, messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};