import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../../contexts/AuthContext';
import './VerifyEmail.css';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleResend = async () => {
    if (currentUser && !currentUser.emailVerified) {
      await sendEmailVerification(currentUser);
      alert('Verification email resent!');
    }
  };

  const handleCheckVerification = async () => {
    if (currentUser?.emailVerified) {
      navigate('/');
    } else {
      alert('Email is still not verified. Please check your inbox.');
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Please verify your email</h2>
      <p>We've sent a verification email to {currentUser?.email}. Please check your inbox.</p>
      <div className="verify-email-buttons">
        <button onClick={handleResend}>Resend Verification Email</button>
        <button onClick={handleCheckVerification}>I've Verified My Email</button>
        <button onClick={async () => {
          await auth.signOut();
          navigate('/login');
        }}>Sign Out</button>
      </div>
    </div>
  );
};

export default VerifyEmail;