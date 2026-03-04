
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { firestore } from '../../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ReactComponent as PostsIcon } from '../../assets/posts-icon.svg';
import { ReactComponent as ReelsIcon } from '../../assets/reels-icon.svg';
import { ReactComponent as TaggedIcon } from '../../assets/tagged-icon.svg';
import { ReactComponent as Like } from '../../assets/thunder.svg';
import { ReactComponent as LikeNotFilled } from '../../assets/thunder-notfilled.svg';
import { ReactComponent as ModalClose } from '../../assets/modal-close.svg';
import { ReactComponent as SendPost } from '../../assets/send-post.svg';
import { ReactComponent as SavePost } from '../../assets/save-post.svg';
import { useFriendContext } from '../../contexts/FriendContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFeed } from '../../contexts/FeedContext';
import { ChatContext } from '../../contexts/MessagesContext';
import Messages from '../Messages/Messages';
import './Profile.css';

const randomNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack"];
const placeholderAvatar = 'https://placehold.co/40';

const Profile: React.FC = () => {
    const { uid } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { sendFriendRequest, friends, sentRequests, refreshFriends } = useFriendContext();
    const { feedPosts, commentVisibility, newComment, userDataMap, toggleComments, handleCommentChange, handleAddComment, handleLike } = useFeed();
    const { setSelectedUser } = useContext(ChatContext);
    const [userData, setUserData] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);
    const [friendStatus, setFriendStatus] = useState<'not_friend' | 'friend' | 'request_sent'>('not_friend');
    const [showMessages, setShowMessages] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!uid) return;

            try {
                // Fetch user data
                const userRef = doc(firestore, "users", uid);
                const userSnapshot = await getDoc(userRef);
                const user = userSnapshot.exists() ? userSnapshot.data() : null;

                // Fetch posts data
                const postsRef = collection(firestore, "posts");
                const q = query(postsRef, where("userId", "==", uid));
                const postsSnapshot = await getDocs(q);
                const fetchedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setUserData(user);
                setPosts(fetchedPosts);

                // Check friend status
                if (friends.some(friend => friend.id === uid)) {
                    setFriendStatus('friend');
                } else if (sentRequests.includes(uid)) {
                    setFriendStatus('request_sent');
                } else {
                    setFriendStatus('not_friend');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [uid, friends, sentRequests]);

    const handleImageClick = (post: any) => {
        setSelectedImage(post.fileURL);
        setSelectedPost(post);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
        setSelectedPost(null);
    };

    const handleTabClick = (tab: 'posts' | 'reels' | 'tagged') => {
        setSelectedTab(tab);
    };

    const handleFollowClick = async () => {
        if (friendStatus === 'not_friend' && uid) {
            await sendFriendRequest(uid);
            setFriendStatus('request_sent');
            await refreshFriends();
        }
    };

    const handleMessageClick = () => {
        if (uid && userData) {
            setSelectedUser({
                id: uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                avatarUrl: userData.avatarUrl,
                isOnline: userData.isOnline || false,
            });
            setShowMessages(true);
        }
    };


    if (!userData) {
        return <div className="profile-container">User not found</div>;
    }

    if (showMessages) {
        return <Messages />;
    }

    return (
        <div className="profile-container">
            <div className="banner"></div>
            <div className="header">
                <div className='main-header'>
                    <div className='avatar-container'>
                        <img className="avatar" src={userData.avatarUrl || 'https://placehold.co/120'} alt="Avatar" />
                        <span className='name-container'>
                            <h1 className="name">
                                {userData.firstName} {userData.lastName}
                            </h1>
                            <p className="role">{userData.bio || 'No bio available'}</p>
                            <div className="stats">
                                <div className="stat">{posts.length} Posts</div>
                                <div className="stat">{userData.followers || 0} Followers</div>
                                <div className="stat">{userData.following || 0} Following</div>
                            </div>
                        </span>
                    </div>
                    <div className="actions">
                        {currentUser && currentUser.uid !== uid && (
                            <>
                                <button
                                    className="button"
                                    onClick={handleFollowClick}
                                    disabled={friendStatus === 'friend' || friendStatus === 'request_sent'}
                                >
                                    {friendStatus === 'friend' ? 'Friends' :
                                        friendStatus === 'request_sent' ? 'Request Sent' : 'Follow'}
                                </button>
                                {friendStatus === 'friend' && (
                                    <button className="button" onClick={handleMessageClick}>Message</button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="tabs">
                <div
                    className={`tab ${selectedTab === 'posts' ? 'active' : ''}`}
                    onClick={() => handleTabClick('posts')}
                >
                    <PostsIcon />POSTS
                </div>
                <div
                    className={`tab ${selectedTab === 'reels' ? 'active' : ''}`}
                    onClick={() => handleTabClick('reels')}
                >
                    <ReelsIcon />REELS
                </div>
                <div
                    className={`tab ${selectedTab === 'tagged' ? 'active' : ''}`}
                    onClick={() => handleTabClick('tagged')}
                >
                    <TaggedIcon />TAGGED
                </div>
            </div>
            <div className="gallery">
                {selectedTab === 'posts' && feedPosts.filter(post => post.userId === uid).map((post, index) => (
                    <img
                        key={post.id}
                        className="image"
                        src={post.fileURL}
                        alt={`Post ${index + 1}`}
                        onClick={() => handleImageClick(post)}
                    />
                ))}
            </div>
            {selectedImage && selectedPost && (
                <div className="modal-profile-image">
                    <div className="modal-profile-image-content">
                        <ModalClose className="modal-profile-close-button" onClick={handleCloseModal} />
                        <div className="modal-image-container">
                            <img className="modal-profile-image-image" src={selectedImage} alt="Selected Post" />
                        </div>
                        <div className="modal-info-container">
                            <div className="modal-user-info">
                                <img
                                    className="modal-avatar"
                                    src={selectedPost.avatarUrl}
                                    alt="User Avatar"
                                />
                                <div>
                                    <h3 className="modal-username">{selectedPost.userName}</h3>
                                    <p className="modal-date">Posted on {new Date(selectedPost.comments[0]?.createdAt?.toDate()).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="modal-comments">
                                <ul className="comments-list">
                                    {selectedPost.comments.map((comment: any) => (
                                        <li key={comment.id} className="comment-item">
                                            <span className='modal-img-comment-container'>
                                                <img src={userDataMap[comment.uid]?.avatarUrl || placeholderAvatar} alt={`${userDataMap[comment.uid]?.userName}'s avatar`} className="comment-avatar" />
                                                <span>
                                                    <span className='modal-comment-name-and-text'>
                                                        <p className="comment-user">{userDataMap[comment.uid]?.userName}</p>
                                                        <p className="comment-text">{comment.text}</p>
                                                    </span>
                                                    <div>
                                                        <span className="comment-timestamp">{new Date(comment.createdAt.toDate()).toLocaleString()}</span>
                                                    </div>
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="profile-modal-actions">
                                    <div className='modal-left-side-actions'>
                                        <div onClick={() => handleLike(selectedPost.id)} className={`like-button ${selectedPost.likes.includes(currentUser?.uid || '') ? 'liked' : ''}`}>
                                            {selectedPost.likes.includes(currentUser?.uid || '') ? <Like className="post-all-actions-clicked" /> : <LikeNotFilled className="post-all-actions" />}
                                        </div>
                                        <SendPost className='modal-icons' onClick={() => toggleComments(selectedPost.id)} />
                                    </div>

                                    <div className='modal-right-side-actions'>
                                        <SavePost className='modal-icons' onClick={() => console.log("Post saved!")} />
                                    </div>
                                </div>
                                <div className="comment-form">
                                    <input
                                        type="text"
                                        value={newComment[selectedPost.id] || ''}
                                        onChange={(e) => handleCommentChange(selectedPost.id, e.target.value)}
                                        placeholder="Write a comment..."
                                    />
                                    <button className="button" onClick={() => handleAddComment(selectedPost.id)}>Post</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
