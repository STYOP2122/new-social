// src/components/VerifyEmail.tsx
import React, { useEffect, useState } from 'react';
import { auth } from '../../firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (auth.currentUser && auth.currentUser.emailVerified) {
        navigate('/'); // Переход на главную страницу, если email подтверждён
      }
    };

    checkEmailVerification();
  }, [navigate]);

  const handleResendVerification = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setMessage('Verification email sent again! Check your inbox.');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred.');
      }
    }
  };

  return (
    <div className="verify-email-container">
      <h2>Verify Your Email</h2>
      <p>Please verify your email address to continue.</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleResendVerification}>Resend Verification Email</button>
    </div>
  );
};

export default VerifyEmail;