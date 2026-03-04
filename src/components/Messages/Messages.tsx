
import React, { useState, useEffect, useRef, useContext } from "react";
import { collection, doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { firestore, auth } from "../../firebaseConfig";
import { ChatContext } from "../../contexts/MessagesContext";
import { ReactComponent as WriteMessageIcon } from "../../assets/message-write.svg";
import { ReactComponent as CallIcon } from "../../assets/call-icon.svg";
import { ReactComponent as VideoCallIcon } from "../../assets/video-call-icon.svg";
import { ReactComponent as SendIcon } from "../../assets/send-icon.svg";
import { ReactComponent as EmojiIcon } from "../../assets/emoji-icon.svg";
import { ReactComponent as AttachIcon } from "../../assets/attach-icon.svg";
import { ReactComponent as VoiceIcon } from "../../assets/voice-icon.svg";
import { ReactComponent as BackIcon } from "../../assets/back-icon.svg";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import "./Messages.css";

const Messages: React.FC = () => {
  const { users, selectedUser, setSelectedUser, messages, sendMessage } = useContext(ChatContext);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isEmojiPickerOpen, setEmojiPickerOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [containerHeight, setContainerHeight] = useState('100vh');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageSound = new Audio("/assets/send-message-sound.mp3");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    sendMessageSound.play();
    await sendMessage(newMessage);
    setNewMessage("");
  };

  const attachFile = () => {
    alert("Attach file functionality coming soon!");
  };

  const recordVoiceMessage = () => {
    alert("Voice message recording functionality coming soon!");
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const toggleEmojiPicker = () => {
    setEmojiPickerOpen((prev) => !prev);
  };

  const goBack = () => {
    setSelectedUser(null);
  };

  useEffect(() => {
    const updateHeight = () => {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const footerHeight = document.querySelector('footer')?.offsetHeight || 0;
      const totalHeight = window.innerHeight - headerHeight - footerHeight;
      setContainerHeight(`${totalHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className="messages-container" style={{ height: containerHeight }}>
      {(!isMobile || (isMobile && !selectedUser)) && (
        <div className="chats-list">
          {users.map((user) => (
            <div
              key={user.id}
              className={`chat-item ${selectedUser?.id === user.id ? "selected" : ""}`}
              onClick={() => setSelectedUser(user)}
            >
              <img
                src={user.avatarUrl ? user.avatarUrl : 'https://placehold.co/40'}
                alt="avatar"
                className="messages-avatar"
              />
              <div className="chat-info">
                <span className="chat-name">{user.firstName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!isMobile || (isMobile && selectedUser)) && (
        <div className="chat-messages">
          {selectedUser ? (
            <>
              <div className="chat-header">
                {isMobile && (
                  <BackIcon className="back-icon" onClick={goBack} />
                )}
                <div className="user-info">
                  <div className="user-image-container">
                    <img
                      src={selectedUser.avatarUrl ? selectedUser.avatarUrl : 'https://placehold.co/40'}
                      alt="avatar"
                      className="messages-avatar"
                    />
                    <div className={`status-indicator ${selectedUser.isOnline ? "online" : "offline"}`} />
                  </div>
                  <h3>{selectedUser.firstName} {selectedUser.lastName}</h3>
                </div>
                <div className="call-buttons">
                  <CallIcon className="call-icon" />
                  <VideoCallIcon className="video-call-icon" />
                </div>
              </div>

              <div className="messages-list">
                {messages.map((message) => (
                  <div key={message.id}>
                    {message.senderId === auth.currentUser?.uid ? (
                      <div className="my-message">
                        <div className="message-content">{message.text}</div>
                      </div>
                    ) : (
                      <div className="message-item">
                        <div className="message-info">
                          <img src={selectedUser.avatarUrl || "https://placehold.co/50"} alt="avatar" className="messages-avatar" />
                          <div className="message-not-own-container">
                            <div className="username-message-container">
                              <span className="message-name">{selectedUser?.firstName}</span>
                            </div>
                            <div className="message-content">{message.text}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                {isEmojiPickerOpen && (
                  <div className="emoji-picker-container">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                )}
                <div className="message-input-input-container">
                  <div className="input-icons">
                    <EmojiIcon className="input-icon" onClick={toggleEmojiPicker} />
                  </div>
                  <input
                    type="text"
                    className="message-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <AttachIcon className="input-icon" onClick={attachFile} />
                  <VoiceIcon className="input-icon" onClick={recordVoiceMessage} />
                  <SendIcon className="input-icon" onClick={handleSendMessage} />
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">Select a chat to start messaging</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;