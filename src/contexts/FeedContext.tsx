
import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, onSnapshot, addDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';

interface FeedContextType {
  feedPosts: Post[];
  commentVisibility: { [key: string]: boolean };
  newComment: { [key: string]: string };
  userDataMap: { [key: string]: { userName: string, avatarUrl: string } };
  toggleComments: (postId: string) => void;
  handleCommentChange: (postId: string, text: string) => void;
  handleAddComment: (postId: string) => Promise<void>;
  handleLike: (postId: string) => Promise<boolean>;
  addPost: (post: Omit<Post, 'id'>) => Promise<void>;
}

interface Comment {
  id: string;
  uid: string;
  text: string;
  createdAt: Timestamp;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  postText: string;
  images: string[];
  comments: Comment[];
  likes: string[];
  reposts: number;
  fileURL: string;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [commentVisibility, setCommentVisibility] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [userDataMap, setUserDataMap] = useState<{ [key: string]: { userName: string, avatarUrl: string } }>({});
  const auth = getAuth();
  const { currentUser } = useAuth();

  const loadFeedData = () => {
    if (!currentUser) return;

    const postsCollection = collection(firestore, 'posts');
    const unsubscribe = onSnapshot(postsCollection, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const post = postDoc.data() as Post;
          const userRef = doc(firestore, 'users', post.userId);
          const userDoc = await getDoc(userRef);
          const user = userDoc.data();
          
          const commentUserIds = new Set((post.comments || []).map(comment => comment.uid));
          const commentUserData = await fetchUserData(commentUserIds);
          setUserDataMap(prevMap => ({ ...prevMap, ...commentUserData }));

          return {
            ...post,
            id: postDoc.id,
            userName: `${user?.firstName} ${user?.lastName}`,
            avatarUrl: user?.avatarUrl || 'https://placehold.co/40',
            comments: post.comments || [],
            likes: post.likes || [],
            images: post.images || [],
          };
        })
      );
      setFeedPosts(postsData);
    });

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (currentUser) {
      unsubscribe = loadFeedData();
    } else {
      setFeedPosts([]);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  const fetchUserData = async (userIds: Set<string>) => {
    const userData: { [key: string]: { userName: string, avatarUrl: string } } = {};
    const userPromises = Array.from(userIds).map(async (uid) => {
      const userRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const user = userDoc.data();
        userData[uid] = {
          userName: `${user?.firstName} ${user?.lastName}`,
          avatarUrl: user?.avatarUrl || 'https://placehold.co/40',
        };
      }
    });
    await Promise.all(userPromises);
    return userData;
  };

  const toggleComments = (postId: string) => {
    setCommentVisibility(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId: string, text: string) => {
    setNewComment(prev => ({ ...prev, [postId]: text }));
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    const userUID = auth.currentUser?.uid;
    if (!userUID) {
      console.error('User not authenticated');
      return;
    }

    const newCommentData: Comment = {
      id: Date.now().toString(),
      uid: userUID,
      text: commentText,
      createdAt: Timestamp.now(),
    };

    try {
      const postRef = doc(firestore, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newCommentData)
      });

      setFeedPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: [...(post.comments || []), newCommentData] }
            : post
        )
      );

      setNewComment(prev => ({ ...prev, [postId]: '' }));

      if (!userDataMap[userUID]) {
        const userData = await fetchUserData(new Set([userUID]));
        setUserDataMap(prev => ({ ...prev, ...userData }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async (postId: string): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('User not authenticated');
      return false;
    }

    const postIndex = feedPosts.findIndex(post => post.id === postId);
    if (postIndex === -1) return false;

    const post = feedPosts[postIndex];
    const isLiked = post.likes.includes(currentUser.uid);
    let newLikes;

    if (isLiked) {
      newLikes = post.likes.filter(uid => uid !== currentUser.uid);
    } else {
      newLikes = [...post.likes, currentUser.uid];
    }

    const updatedPosts = [...feedPosts];
    updatedPosts[postIndex] = { ...post, likes: newLikes };
    setFeedPosts(updatedPosts);

    try {
      const postRef = doc(firestore, 'posts', postId);
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(currentUser.uid) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUser.uid) });
      }
      return !isLiked; // Возвращаем true, если лайк был добавлен, и false, если удален
    } catch (error) {
      console.error('Error updating like:', error);
      setFeedPosts(feedPosts);
      return isLiked; // В случае ошибки возвращаем предыдущее состояние
    }
  };

  const addPost = async (post: Omit<Post, 'id'>) => {
    try {
      const postsCollection = collection(firestore, 'posts');
      const docRef = await addDoc(postsCollection, post);
      const newPost: Post = { ...post, id: docRef.id };
      setFeedPosts(prevPosts => [newPost, ...prevPosts]);
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const value = {
    feedPosts,
    commentVisibility,
    newComment,
    userDataMap,
    toggleComments,
    handleCommentChange,
    handleAddComment,
    handleLike,
    addPost,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeed must be used within a FeedProvider');
  }
  return context;
};
