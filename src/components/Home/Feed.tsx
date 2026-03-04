
import React from 'react';
import { useFeed } from '../../contexts/FeedContext';
import { getAuth } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import './Feed.css';
import { ReactComponent as Like } from '../../assets/thunder.svg';
import { ReactComponent as LikeNotFilled } from '../../assets/thunder-notfilled.svg';
import { ReactComponent as Commentary } from '../../assets/commentary.svg';
import { ReactComponent as SendPost } from '../../assets/send-post.svg';
import { ReactComponent as SavePost } from '../../assets/save-post.svg';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const Feed: React.FC = () => {
  const {
    feedPosts,
    commentVisibility,
    newComment,
    userDataMap,
    toggleComments,
    handleCommentChange,
    handleAddComment,
    handleLike
  } = useFeed();

  const { createNotification } = useNotifications();
  const auth = getAuth();
  const { currentUser } = useAuth();

  const formatTimestamp = (timestamp: Timestamp) => {
    const now = new Date();
    const commentDate = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleLikeWithNotification = async (postId: string, postOwnerId: string) => {
    const isLiked = await handleLike(postId); // Предполагается, что handleLike возвращает true, если лайк установлен, и false, если снят
  
    if (isLiked && currentUser && currentUser.uid !== postOwnerId) {
      await createNotification({
        type: 'like',
        senderId: currentUser.uid,
        recipientId: postOwnerId,
        message: 'liked your post',
        user: {
          name: currentUser.displayName || 'User',
          avatar: currentUser.photoURL || '',
        },
      });
    }
  };

  const handleAddCommentWithNotification = async (postId: string, postOwnerId: string) => {
    await handleAddComment(postId);
    if (currentUser && currentUser.uid !== postOwnerId) {
      const commentText = newComment[postId] || '';
      const truncatedComment = commentText.length > 14 ? `${commentText.slice(0, 14)}...` : commentText;
      await createNotification({
        type: 'message',
        senderId: currentUser.uid,
        recipientId: postOwnerId,
        message: `commented on your post: ${truncatedComment}`,
        user: {
          name: currentUser.displayName || 'User',
          avatar: currentUser.photoURL || '',
        },
      });
    }
  };

  return (
    <div className="feed">
      {feedPosts.map((post) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <Link to={`/profile/${post?.userId}`} className="profile-info">
              <img src={post.avatarUrl} alt={`${post.userName}'s profile`} className="user-image" />
              <span className='post-first-container'>
                <span className="user-name">{post.userName}</span>
              </span>
            </Link>
            <p className="post-text">{post.postText}</p>
          </div>
          <div className="post-images">
            {post.images.length > 1 ? (
              <div className="image-wrapper">
                {post.images.map((image, index) => (
                  <div className="image-container" key={index}>
                    <img src={image} alt={`post-${index}`} className="post-image" />
                  </div>
                ))}
              </div>
            ) : (
              <img src={post.fileURL} alt="post" className="single-image" />
            )}
            <div className="image-actions">
              <div className="like-container">{post.likes.length} Likes</div>
              <span className="comment-info">
                {post.comments.length} Comments {post.reposts} Reposts
              </span>
            </div>
          </div>
          <div className="post-actions">
            <div className="left-actions-container">
              <div onClick={() => handleLikeWithNotification(post.id, post.userId)} className={`like-button ${post.likes.includes(auth.currentUser?.uid || '') ? 'liked' : ''}`}>
                {post.likes.includes(auth.currentUser?.uid || '') ? <Like className="post-all-actions-clicked" /> : <LikeNotFilled className="post-all-actions" />}
              </div>
              <div onClick={() => toggleComments(post.id)} className="comment-toggle">
                <Commentary className="post-commentary" />
              </div>
              <SendPost className="post-all-actions" />
            </div>
            <div className="right-actions-container">
              <SavePost className="post-all-actions" />
            </div>
          </div>
          {commentVisibility[post.id] && (
            <div className="post-comments">
              <div className="comment-input-container">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment[post.id] || ''}
                  onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  className="comment-input"
                />
                <button className="comment-add-button" onClick={() => handleAddCommentWithNotification(post.id, post.userId)}>Send</button>
              </div>
              <div className='comments-container'>
                {post.comments.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds).map((comment) => {
                  const userData = userDataMap[comment.uid] || { userName: 'Anonymous', avatarUrl: 'https://placehold.co/40' };
                  return (
                    <div key={comment.id} className="comment">
                      <img src={userData.avatarUrl} alt={`${userData.userName}'s avatar`} className="comment-avatar" />
                      <div className="comment-content">
                        <strong className='comment-header'>{userData.userName} <span className="comment-timestamp">{formatTimestamp(comment.createdAt)}</span></strong>
                        <p>{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Feed;
