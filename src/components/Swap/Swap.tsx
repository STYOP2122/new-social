
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ReactComponent as SwapSettings } from '../../assets/swap-settings.svg';
import SCNIcon from '../../assets/soft-coin-icon.png';
import FTNIcon from '../../assets/fast-token-icon.png';
import { auth, firestore } from '../../firebaseConfig';
import { doc, onSnapshot, runTransaction } from 'firebase/firestore';
import './Swap.css';


const drawCheck = keyframes`

`;

const AnimatedCheckmark = styled.svg`

`;

const Swap: React.FC = () => {
    const [scnBalance, setScnBalance] = useState(0);
    const [ftnBalance, setFtnBalance] = useState(0);
    const [scnAmount, setScnAmount] = useState('');
    const [ftnAmount, setFtnAmount] = useState('');
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapStatus, setSwapStatus] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [swapSuccess, setSwapSuccess] = useState(false);
    const [containerHeight, setContainerHeight] = useState('100vh');
    const exchangeRate = 1 / 15500; // 1 SCN = 0.0000645161 FTN
    const ftnUsdRate = 3.24; // 1 FTN = 3.24 USD
    const scnUsdRate = ftnUsdRate * exchangeRate;

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                const userRef = doc(firestore, 'users', user.uid);
                onSnapshot(userRef, (doc) => {
                    if (doc.exists()) {
                        const userData = doc.data();
                        setScnBalance(userData.balance || 0);
                        setFtnBalance(userData.ftnBalance || 0);
                    }
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const handleScnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const scn = e.target.value;
        setScnAmount(scn);
        updateFtnAmount(scn);
    };

    const updateFtnAmount = (scn: string) => {
        const ftn = scn ? (parseFloat(scn) * exchangeRate).toFixed(7) : '';
        setFtnAmount(ftn);
    };

    const handleMaxClick = () => {
        setScnAmount(scnBalance.toString());
        updateFtnAmount(scnBalance.toString());
    };

    const handleSwap = async () => {
        const scnToSwap = parseFloat(scnAmount);
        const ftnToReceive = parseFloat(ftnAmount);

        if (scnToSwap > scnBalance) {
            setSwapStatus("Insufficient SCN balance");
            setShowModal(true);
            setSwapSuccess(false);
            return;
        }

        const user = auth.currentUser;
        if (user) {
            setIsSwapping(true);
            setShowModal(true);
            setSwapStatus("Processing swap...");
            setSwapSuccess(false);
            const userRef = doc(firestore, 'users', user.uid);
            
            try {
                await runTransaction(firestore, async (transaction) => {
                    const userDoc = await transaction.get(userRef);
                    if (!userDoc.exists()) {
                        throw "User document does not exist!";
                    }
                    const userData = userDoc.data();
                    const newScnBalance = (userData.balance || 0) - scnToSwap;
                    const newFtnBalance = (userData.ftnBalance || 0) + ftnToReceive;
                    
                    if (newScnBalance < 0) {
                        throw "Insufficient SCN balance";
                    }
                    
                    transaction.update(userRef, { 
                        balance: newScnBalance,
                        ftnBalance: newFtnBalance
                    });
                });
                
                setSwapStatus("Swap successful!");
                setSwapSuccess(true);
                setTimeout(() => {
                    setShowModal(false);
                    setScnAmount('');
                    setFtnAmount('');
                    setSwapSuccess(false);
                }, 3000);
            } catch (error) {
                console.error("Swap failed: ", error);
                setSwapStatus(`Swap failed: ${error}`);
                setSwapSuccess(false);
                setTimeout(() => setShowModal(false), 3000);
            } finally {
                setIsSwapping(false);
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
        <div className="swap-container" style={{ height: containerHeight }}>
            <div className="swap-card">
                <div className="swap-header">
                    <h2>Swap</h2>
                    <SwapSettings className="swap-settings-button" />
                </div>
                <div className='first-swap-container'>
                    <div className='left-swap-container'>
                        <span className='selected-coin'>
                            <img className='selected-coin-img' src={SCNIcon} alt="SCN" />
                            SCN
                        </span>
                        <span className='first-swap-balance'>
                            <span>Balance:</span>
                            <span>{scnBalance.toFixed(2)} SCN</span>
                            <span onClick={handleMaxClick}>(Max)</span>
                        </span>
                    </div>

                    <div className='right-swap-container'>
                        <input
                            type="number"
                            className='swapping-count'
                            value={scnAmount}
                            onChange={handleScnChange}
                            placeholder="0.00"
                        />
                        <span className='price-in-usd'>
                            = ${scnAmount ? (parseFloat(scnAmount) * scnUsdRate).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>

                <div className='second-swap-container'>
                    <div className='left-swap-container'>
                        <span className='selected-coin'>
                            <img className='selected-coin-img' src={FTNIcon} alt="FTN" />
                            FTN
                        </span>
                        <span className='first-swap-balance'>
                            <span>Balance:</span>
                            <span>{ftnBalance.toFixed(7)} FTN</span>
                        </span>
                    </div>

                    <div className='right-swap-container'>
                        <input
                            type="number"
                            className='swapping-count'
                            value={ftnAmount}
                            onChange={() => {}}
                            placeholder="0.00"
                            readOnly
                        />
                        <span className='price-in-usd'>
                            = ${ftnAmount ? (parseFloat(ftnAmount) * ftnUsdRate).toFixed(2) : '0.00'}
                        </span>
                    </div>
                </div>

                <div className='exchange-rate-info'>
                    <span>1 FTN = $3.24 USD</span>
                    <span>1 SCN = ${scnUsdRate.toFixed(7)} USD</span>
                </div>
                <span className='button-swap-container'>
                    <button onClick={handleSwap} className="swap-button" disabled={isSwapping}>
                        {isSwapping ? 'Swapping...' : 'Swap'}
                    </button>
                </span>
            </div>
            {showModal && (
                <div className='swap-status-modal-container'>
                    <div className='swap-status-modal'>
                        <h2>{swapStatus}</h2>
                        {swapSuccess && (
                            <svg className='status-checkbox-completed' viewBox="0 0 100 100">
                                <path d="M20,50 L40,70 L80,30" fill="none" />
                            </svg>
                        )} 
                    </div>
                </div>
            )}
        </div>
    );
};

export default Swap;
