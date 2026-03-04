import { collection, addDoc, getDocs, updateDoc, doc, query, where, getDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, firestore } from "../firebaseConfig";

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

class FriendService {
  static async sendFriendRequest(friendId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authorized");
      }

      const friendRequestsCollection = collection(firestore, "friendRequests");
      await addDoc(friendRequestsCollection, {
        fromUserId: currentUser.uid,
        toUserId: friendId,
        status: "pending",
      });

    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  }

  static async fetchFriendRequests(): Promise<FriendRequest[]> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authorized");
      }

      const friendRequestsCollection = collection(firestore, "friendRequests");
      const q = query(friendRequestsCollection, where("toUserId", "==", currentUser.uid), where("status", "==", "pending"));
      const requestDocs = await getDocs(q);

      return requestDocs.docs.map((doc) => ({
        id: doc.id,
        fromUserId: doc.data().fromUserId,
        toUserId: doc.data().toUserId,
        status: doc.data().status
      }));
    } catch (error) {
      console.error("Error loading friend requests:", error);
      return [];
    }
  }

  static async respondToFriendRequest(requestId: string, accept: boolean, fromUserId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authorized");
      }

      const requestDocRef = doc(firestore, "friendRequests", requestId);
      const requestDoc = await getDoc(requestDocRef);

      if (!requestDoc.exists()) {
        throw new Error("Friend request not found");
      }

      if (accept) {
        // Update request status
        await updateDoc(requestDocRef, { status: "accepted" });

        // Add to friends list (for both users)
        const currentUserRef = doc(firestore, "users", currentUser.uid);
        const friendUserRef = doc(firestore, "users", fromUserId);

        await updateDoc(currentUserRef, {
          friends: arrayUnion(fromUserId)
        });

        await updateDoc(friendUserRef, {
          friends: arrayUnion(currentUser.uid)
        });

      } else {
        await updateDoc(requestDocRef, { status: "rejected" });

      }
    } catch (error) {
      console.error("Error processing friend request:", error);
    }
  }

  static async fetchAllFriends(userId: string): Promise<Friend[]> {
    try {
      const userDocRef = doc(firestore, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User not found");
      }

      const userData = userDoc.data();
      const friendIds = userData.friends || [];

      const friendsList = await Promise.all(friendIds.map(async (friendId: string) => {
        const friendUserDocRef = doc(firestore, "users", friendId);
        const friendUserDoc = await getDoc(friendUserDocRef);
        const friendUserData = friendUserDoc.data();

        return {
          id: friendId,
          firstName: friendUserData?.firstName || "",
          lastName: friendUserData?.lastName || "",
          avatarUrl: friendUserData?.avatarUrl || "",
        };
      }));

      return friendsList;
    } catch (error) {
      console.error("Error fetching friends:", error);
      return [];
    }
  }

  static async removeFriend(friendId: string) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("User is not authorized");
      }

      const currentUserRef = doc(firestore, "users", currentUser.uid);
      const friendUserRef = doc(firestore, "users", friendId);

      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendId)
      });

      await updateDoc(friendUserRef, {
        friends: arrayRemove(currentUser.uid)
      });

    } catch (error) {
      console.error("Error removing friend:", error);
    }
  }
}

export default FriendService;