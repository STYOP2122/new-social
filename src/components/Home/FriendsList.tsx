
import React from 'react';
import { ReactComponent as MessagesIcon } from '../../assets/messages.svg';
import { useFriendContext } from '../../contexts/FriendContext';
import './FriendsList.css';
import { Link } from 'react-router-dom';

const FriendsList: React.FC = () => {
  const { friends } = useFriendContext();

  return (
    <div className="friends-list">
      <span className='friends-title'>Friends</span>
      {friends.length === 0 ? (
        <p>No friends found.</p>
      ) : (
        friends.map((friend) => (
          <Link key={friend.id} className="friend" to={`/profile/${friend.id}`}>
            <img
              src={friend.avatarUrl ? friend.avatarUrl : 'https://placehold.co/40'}
              alt={`${friend.firstName}'s profile`}
              className="friend-image"
            />
            <div className="friend-info">
              <span className="friend-name">{friend.firstName} {friend.lastName}</span>
            </div>
            <MessagesIcon className="friend-message" />
          </Link>
        ))
      )}
    </div>
  );
};

export default FriendsList;
