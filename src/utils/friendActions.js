
// friendActions.ts
import { auth, firestore } from "../firebaseConfig";
import { collection, doc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import FriendService from "../services/friendService";

interface FriendAction {
  type: 'follow' | 'unfollow' | 'confirm' | 'reject';
  currentUserId: string;
  targetUserId: string;
}

export const handleFriendAction = async ({ type, currentUserId, targetUserId }: FriendAction): Promise<void> => {
  if (!currentUserId) {
    throw new Error("Current user not authenticated");
  }

  switch (type) {
    case 'follow':
      await sendFriendRequest(currentUserId, targetUserId);
      break;
    case 'unfollow':
      await cancelFriendRequest(currentUserId, targetUserId);
      break;
    case 'confirm':
      await confirmFriendRequest(currentUserId, targetUserId);
      break;
    case 'reject':
      await rejectFriendRequest(currentUserId, targetUserId);
      break;
    default:
      throw new Error("Invalid action type");
  }
};

const sendFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  const requestRef = doc(collection(firestore, "friendRequests"));
  await setDoc(requestRef, {
    fromUserId,
    toUserId,
    status: 'pending',
    createdAt: new Date()
  });
};

const cancelFriendRequest = async (fromUserId: string, toUserId: string): Promise<void> => {
  const requestsRef = collection(firestore, "friendRequests");
  const q = query(requestsRef, 
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

const confirmFriendRequest = async (currentUserId: string, fromUserId: string): Promise<void> => {
  const requestsRef = collection(firestore, "friendRequests");
  const q = query(requestsRef, 
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", currentUserId),
    where("status", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    await updateDoc(doc.ref, { status: 'confirmed' });
  });

  // Add to friends list for both users
  await FriendService.addFriend(currentUserId, fromUserId);
  await FriendService.addFriend(fromUserId, currentUserId);
};

const rejectFriendRequest = async (currentUserId: string, fromUserId: string): Promise<void> => {
  const requestsRef = collection(firestore, "friendRequests");
  const q = query(requestsRef, 
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", currentUserId),
    where("status", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (doc) => {
    await deleteDoc(doc.ref);
  });
};

export const getFriendStatus = async (currentUserId: string, targetUserId: string): Promise<'none' | 'pending' | 'friend'> => {
  // Check if they are already friends
  const friends = await FriendService.fetchAllFriends(currentUserId);
  if (friends.some(friend => friend.friendId === targetUserId)) {
    return 'friend';
  }

  // Check if there's a pending request
  const requestsRef = collection(firestore, "friendRequests");
  const q = query(requestsRef, 
    where("fromUserId", "in", [currentUserId, targetUserId]),
    where("toUserId", "in", [currentUserId, targetUserId]),
    where("status", "==", "pending")
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return 'pending';
  }

  return 'none';
};