// src/components/Registration.tsx
import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, firestore } from '../../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Registration.css';

const Registration: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [isRegistered, setIsRegistered] = useState(false); // Новое состояние
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
  
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName,
        createdAt: new Date().toISOString(),
        emailVerified: false
      });
  
      setMessage('Registration successful! Please verify your email.');
      setIsRegistered(true);
      
      // Clear form
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (error) {
      setError((error as Error).message);
    }
  };

  useEffect(() => {
    const updateHeight = () => {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const footerHeight = document.querySelector('footer')?.offsetHeight || 0;
      const totalHeight = window.innerHeight - headerHeight - footerHeight;
      setContainerHeight(`${totalHeight}px`);
    };

    updateHeight();const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setMessage(null);
    
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
    
        // Send verification email
        await sendEmailVerification(user);
    
        // Create user document in Firestore
        await setDoc(doc(firestore, 'users', user.uid), {
          email: email,
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date().toISOString(),
          emailVerified: false
        });
    
        setMessage('Registration successful! Please verify your email.');
        setIsRegistered(true);
        
        // Clear form
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        
        // Navigate to verification page
        setTimeout(() => navigate('/verify-email'), 2000);
      } catch (error) {
        setError((error as Error).message);
      }
    };
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className='registration-container' style={{ height: containerHeight }}>
      <div className='registration-subcontainer'>
        <p className='registration-title'>Sign Up to SoftConstruct</p>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {message && <p className='message-email' style={{ color: 'green' }}>{message}</p>}
        
        {!isRegistered ? (
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Email'
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder='First Name'
                required
              />
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder='Last Name'
                required
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password (6+ characters)'
                required
              />
            </div>
            <button type="submit">Sign Up</button>
          </form>
        ) : (
          <div className="registration-success">
            <p>Please check your email to verify your account.</p>
            <p>Didn't receive the email? <button 
              onClick={async () => {
                const user = auth.currentUser;
                if (user) {
                  try {
                    await sendEmailVerification(user);
                    setMessage('Verification email resent!');
                  } catch (error) {
                    setError((error as Error).message);
                  }
                }
              }}
              className="resend-link"
            >
              Resend verification email
            </button></p>
          </div>
        )}
        
        <p className='registration-already'>Already on SoftConstruct? <Link to="/login" className='registration-link'>Sign In</Link></p>
      </div>
    </div>
  );
};

export default Registration;