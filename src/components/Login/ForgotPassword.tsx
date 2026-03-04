// src/components/Login/ForgotPassword.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom'; // импортируем Link
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [containerHeight, setContainerHeight] = useState('100vh'); // Initial height

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset email sent!');
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`Error: ${error.message}`);
            } else {
                setMessage('An unknown error occurred');
            }
        }
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
        <div className='forgot-password-container' style={{ height: containerHeight }}>
            <div className='forgot-password-subcontainer'>
                <p className='forgot-password-title'>Reset Password</p>
                {message && <p>{message}</p>}
                <form onSubmit={handleResetPassword}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        required
                    />
                    <span className='forgot-password-text'>We'll send a verification code to this email if it matches an existing SoftConstruct account.</span>
                    <button type="submit">Next</button>
                </form>
                <Link to="/login" className="back-link">Back</Link> {/* Добавляем ссылку для возврата */}
            </div>
        </div>
    );
};

export default ForgotPassword;
