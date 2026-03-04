import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DollarSign, TrendingUp, ArrowRightCircle } from 'lucide-react';
import { auth, firestore } from '../../firebaseConfig';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './CurrencyButton.css'; // We'll create this CSS file

const CurrencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const localBalanceRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const lastUpdateTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIsOnline(true);
    };
  
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
  
    let unsubscribeUser = () => {};
    let unsubscribeAuth = () => {};
  
    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(firestore, 'users', user.uid);
        
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const lastOnline = userDoc.data().lastOnline?.toDate() || new Date();
          const offlineTime = (Date.now() - lastOnline.getTime()) / 1000;
          const offlineEarnings = offlineTime * 0.01;
          
          localBalanceRef.current = (userDoc.data().balance || 0) + offlineEarnings;
          setBalance(parseFloat(localBalanceRef.current.toFixed(2)));
          
          await updateDoc(userRef, {
            balance: localBalanceRef.current,
            lastOnline: new Date()
          });
        }

        unsubscribeUser = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const firestoreBalance = doc.data().balance || 0;
  
            if (Math.abs(firestoreBalance - localBalanceRef.current) > 0.01) {
              localBalanceRef.current = firestoreBalance;
              setBalance(firestoreBalance);
              lastUpdateTimeRef.current = Date.now();
            }
          }
        });
  
        const updateLocalBalance = () => {
          const now = Date.now();
          const timeSinceLastActivity = now - lastActivityRef.current;
          const isCurrentlyOnline = timeSinceLastActivity < 300000;
          const timeSinceLastUpdate = (now - lastUpdateTimeRef.current) / 1000;
  
          if (isCurrentlyOnline !== isOnline) {
            setIsOnline(isCurrentlyOnline);
          }
  
          const increment = isCurrentlyOnline ? 0.4 : 0.01;
          const totalIncrement = increment * timeSinceLastUpdate;
  
          localBalanceRef.current += totalIncrement;
          lastUpdateTimeRef.current = now;
          setBalance(parseFloat(localBalanceRef.current.toFixed(2)));
        };
  
        const updateFirestoreBalance = async () => {
          const now = Date.now();
          const difference = localBalanceRef.current - balance;
  
          if (Math.abs(difference) > 0.01) {
            try {
              await updateDoc(userRef, {
                balance: parseFloat(localBalanceRef.current.toFixed(2)),
                lastOnline: new Date()
              });
            } catch (error) {
              console.error('Error updating Firestore:', error);
            }
          }
        };
  
        const localIntervalId = setInterval(updateLocalBalance, 1000);
        const firestoreIntervalId = setInterval(updateFirestoreBalance, 2000);
  
        return () => {
          clearInterval(localIntervalId);
          clearInterval(firestoreIntervalId);
          unsubscribeUser();
          updateDoc(userRef, { lastOnline: new Date() });
        };
      }
    });
  
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      unsubscribeUser();
      unsubscribeAuth();
    };
  }, []);

  const toggleOpen = () => setIsOpen(!isOpen);
  const closeIt = () => setIsOpen(false);

  return (
    <div className="currency-button-container">
      <button 
        className={`currency-button ${isOpen ? 'open' : ''}`}
        onClick={toggleOpen}
      >
        <DollarSign size={24} />
      </button>

      {isOpen && (
        <div className="currency-dropdown">
          <h2 className="balance-title">Your Balance</h2>
          <div className="balance-content">
            <div className="balance-amount">
              {balance.toFixed(2)} <span className="currency-symbol">SCN</span>
            </div>
            <div className="earnings-rate">
              <TrendingUp className="trend-icon" size={16} />
              <span className="rate-text">+{isOnline ? '0.4' : '0.01'}/s</span>
            </div>
            <div className="conversion-amount">
              = {(balance / 15500).toFixed(2)} <span className="currency-symbol">FTN</span>
            </div>
          </div>
          <Link 
            onClick={closeIt} 
            to="/swap" 
            className="exchange-button"
          >
            <span>Exchange to FTN</span>
            <ArrowRightCircle size={20} className="arrow-icon" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default CurrencyButton;