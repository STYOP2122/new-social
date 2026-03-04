// Login.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css'

const Login: React.FC = () => {
  const { currentUser, reloadUser } = useAuth(); // Добавляем reloadUser из контекста
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  const [containerHeight, setContainerHeight] = useState('100vh');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

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

  useEffect(() => {
    if (loginSuccess) {
      navigate('/');
    }
  }, [loginSuccess, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      // После успешного входа перезагружаем данные пользователя
      await reloadUser();

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      setLoginSuccess(true);
    } catch (error) {
      const authError = error as AuthError;
      setError(`Error logging in: ${authError.message}`);
      setLoading(false);
    }
  };

  return (
    <div className='login-container' style={{ height: containerHeight }}>
      <div className='login-subcontainer'>
        <p className='login-title'>Sign in to SoftConstruct</p>
        {error && <p className="error-message">{error}</p>}
        {loginSuccess && <p className="success-message">Login successful! Redirecting...</p>}
        <form className='login-form' onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ characters)"
            required
          />
          <div className="login-options">
            <span className='remember-login'>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <p>Remember&nbsp;Me</p>
            </span>
            <Link to="/forgot-password" className="forgot-password-link">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={loading || loginSuccess}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <div className='login-signup'>
            Don't have an account? <Link to="/register" className='login-link'>Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
