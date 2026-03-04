import React from 'react';
import { auth } from "../../firebaseConfig";
import { useFriendContext } from '../../contexts/FriendContext';
import { useUserRecommendations } from '../../contexts/UserReccomendations';
import './FriendReccomendations.css';

const FriendRecommendations: React.FC = () => {
  const { friendRequests, sentRequests, sendFriendRequest, respondToFriendRequest } = useFriendContext();
  const { recommendedUsers } = useUserRecommendations();
  const currentUser = auth.currentUser;

  const handleFollow = async (friendId: string) => {
    if (!currentUser) return;
    await sendFriendRequest(friendId);
  };

  const handleConfirmRequest = async (requestId: string, fromUserId: string) => {
    if (!currentUser) return;
    await respondToFriendRequest(requestId, true, fromUserId);
  };

  return (
    <div className="friend-recommendations">
      <ul className="friend-list">
        {recommendedUsers.map((user) => {
          const isRequested = sentRequests.includes(user.id);
          const showConfirmButton = friendRequests.some(request =>
            request.toUserId === currentUser?.uid && request.fromUserId === user.id && request.status === 'pending'
          );

          return (
            <li key={user.id} className="friend-item">
              <div className="profile-info-reccomendations">
                <div className="profile-image">
                  <img 
                    src={user.avatarUrl ? user.avatarUrl : 'https://placehold.co/40'} 
                    alt={`${user.firstName} ${user.lastName}`} 
                  />
                </div>
                <div className="profile-name">
                  <span className="first-name">{user.firstName} {user.lastName}</span>

                  {isRequested ? (
                    <button className='requested-button'>Requested</button>
                  ) : !showConfirmButton ? (
                    <button className="follow-button" onClick={() => handleFollow(user.id)}>Follow</button>
                  ) : (
                    <button
                      className="confirm-button"
                      onClick={() => {
                        const request = friendRequests.find(request =>
                          request.fromUserId === user.id && request.toUserId === currentUser?.uid
                        );
                        if (request) {
                          handleConfirmRequest(request.id, request.fromUserId);
                        }
                      }}
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="suggested-for-you">
        <div className="suggested-header">
          <span>Suggested for you</span>
          <span className="see-all-button">See All</span>
        </div>
      </div>
    </div>
  );
};

export default FriendRecommendations;