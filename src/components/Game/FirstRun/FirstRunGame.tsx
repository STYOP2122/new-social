
import React, { useState, useEffect } from 'react';
import FTNCoin from '../../../assets/games/FirstRun/fgCoin-D3s7SxdR.png';
import Tap from '../../../assets/games/FirstRun/tap.png';
import Boost from '../../../assets/games/FirstRun/boost.png';
import Energy from '../../../assets/games/FirstRun/energy.png';
import './FirstRunGame.css';

interface FirstRunGameProps {
    onClose: () => void;
}

interface Upgrade {
    name: string;
    cost: number;
    profitBoost: number;
    level: number;
}

const initialUpgrades: Upgrade[] = [
    { name: 'FTN Pair', cost: 0, profitBoost: 100000, level: 0 },
    { name: 'Community', cost: 500, profitBoost: 50, level: 0 },
    { name: 'Lolik', cost: 1000, profitBoost: 100, level: 0 },
    { name: 'BTC Pair', cost: 2000, profitBoost: 200, level: 0 },
    { name: 'Bahamut', cost: 5000, profitBoost: 500, level: 0 },
    { name: 'Wallet', cost: 10000, profitBoost: 1000, level: 0 },
    { name: 'Mutuari', cost: 20000, profitBoost: 2000, level: 0 },
    { name: 'Bridge', cost: 50000, profitBoost: 5000, level: 0 },
    { name: 'Airdrop', cost: 100000, profitBoost: 10000, level: 0 },
];

const Markets: React.FC<{ 
    tokens: number; 
    tokensPerHour: number; 
    currentPage: string; 
    setCurrentPage: React.Dispatch<React.SetStateAction<any>>; 
    setTokens: React.Dispatch<React.SetStateAction<number>>; 
    setTokensPerHour: React.Dispatch<React.SetStateAction<number>>;
    upgrades: Upgrade[];
    setUpgrades: React.Dispatch<React.SetStateAction<Upgrade[]>>;
}> = ({ tokens, tokensPerHour, currentPage, setCurrentPage, setTokens, setTokensPerHour, upgrades, setUpgrades }) => {

    const handlePurchase = (index: number) => {
        const upgrade = upgrades[index];
        if (tokens >= upgrade.cost) {
            setTokens(prevTokens => prevTokens - upgrade.cost);
            setTokensPerHour(prevTokensPerHour => prevTokensPerHour + upgrade.profitBoost);
    
            const newUpgrades = [...upgrades];
            newUpgrades[index] = {
                ...upgrade,
                level: upgrade.level + 1,
                cost: Math.floor(upgrade.cost * 1.5),
                profitBoost: Math.floor(upgrade.profitBoost * 1.2)
            };
            setUpgrades(newUpgrades);
        } else {
            alert('Not enough tokens!');
        }
    };

    return (
        <div className="markets">
            <span className='first-run-info'>
                <div className='first-run-title-div hasBorder'>
                    Earn Per Tap
                    <span>
                        <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                        3
                    </span>
                </div>

                <div className='first-run-title-div hasBg'>
                    Coins To Level Up
                    <span>
                        <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                        1M
                    </span>
                </div>

                <div className='first-run-title-div hasBg'>
                    Profit Per Hour
                    <span>
                        <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                        +{tokensPerHour.toFixed(2)}
                    </span>
                </div>
            </span>

            <div className='first-run-total-coins'>
                <img className='large-icon' src={FTNCoin} alt="Large Coin Icon" />
                <span className='coins-count'>{Math.floor(tokens).toLocaleString()}</span>
            </div>

            <span className='markets-to-home-navigate-button' onClick={() => setCurrentPage('Home')}>
                <p>Markets</p>
            </span>

            <div className='usersListContainerContent'>
                <div className='marketsCardHolder'>
                    {upgrades.map((upgrade, index) => (
                        <div className='marketsCardItem' key={index} onClick={() => handlePurchase(index)}>
                            <div className='marketsCardHead'>
                                <img src={FTNCoin} className='marketsCardCoin' alt="Coin Icon" />
                                <div className='marketsCardTitle'>
                                    <h3 className='marketsCardTitle'>{upgrade.name}</h3>
                                    <span className='marketsCardDesc'>per hour</span>
                                    <div className='cryptoCountHolder small'>
                                        <img src={FTNCoin} className='cryptoCurrencyImg' alt="Coin Icon" />
                                        <span className='cryptoPriceSum'>+{upgrade.profitBoost}</span>
                                    </div>
                                </div>
                            </div>

                            <div className='marketsCardBottom'>
                                <h3 className='marketsCardTitle'>Lvl {upgrade.level}</h3>
                                <span className='marketsCardDivider'></span>
                                <div className='cryptoCountHolder medium'>
                                    <img src={FTNCoin} className='cryptoCurrencyImg' alt="Coin Icon" />
                                    <span className='cryptoPriceSum'>{upgrade.cost}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FirstRunGame: React.FC<FirstRunGameProps> = ({ onClose }) => {
    const [tokens, setTokens] = useState(0);
    const [level, setLevel] = useState(1);
    const [tokensPerHour, setTokensPerHour] = useState(0);
    const [progress, setProgress] = useState(0);
    const [energy, setEnergy] = useState(4500);
    const [boostActive, setBoostActive] = useState(false);
    const [currentPage, setCurrentPage] = useState<'Home' | 'Markets'>('Home');
    const [upgrades, setUpgrades] = useState<Upgrade[]>(initialUpgrades);

    const levelThresholds = [0, 1000, 15000, 300000, 1000000, 10000000, 100000000, 300000000, 500000000, 1000000000];

    useEffect(() => {
        const interval = setInterval(() => {
            // Увеличиваем токены в зависимости от прибыли в час
            setTokens(prevTokens => prevTokens + tokensPerHour / 3600);
        }, 1000);
    
        return () => clearInterval(interval);
    }, [tokensPerHour]);

    useEffect(() => {
        const newLevel = levelThresholds.findIndex(threshold => tokens < threshold) || levelThresholds.length;
        setLevel(newLevel);

        const lowerThreshold = levelThresholds[newLevel - 1] || 0;
        const upperThreshold = levelThresholds[newLevel] || levelThresholds[levelThresholds.length - 1];
        const newProgress = ((tokens - lowerThreshold) / (upperThreshold - lowerThreshold)) * 100;
        setProgress(newProgress);
    }, [tokens]);

    const handleCollectTokens = () => {
        if (energy > 0) {
            const baseTokens = 3;
            const tokensToAdd = boostActive ? baseTokens * 2 : baseTokens;
            setTokens(prevTokens => prevTokens + tokensToAdd);
            setEnergy(prevEnergy => prevEnergy - 1);
            const tapImg = document.querySelector('.tap-img');
            if (tapImg) {
                tapImg.classList.add('clicked');
                setTimeout(() => {
                    tapImg.classList.remove('clicked');
                }, 500);
            }
        } else {
            alert('No Energy!');
        }
    };

    const handleUseBoost = () => {
        if (energy >= 500) {
            setEnergy(prevEnergy => prevEnergy - 500);
            setBoostActive(true);
            setTimeout(() => {
                setBoostActive(false);
            }, 10000);
        } else {
            alert('Not enough energy to activate boost!');
        }
    };

    const handleBackgroundClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).classList.contains('first-run-modal')) {
            onClose();
        }
    };

    return (
        <div className="first-run-modal" onClick={handleBackgroundClick}>
            <div className="first-run-modal-content">
                {currentPage === 'Home' && (
                    <>
                        <span className='first-run-info'>
                            <div className='first-run-title-div hasBorder'>
                                Earn Per Tap
                                <span>
                                    <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                                    {boostActive ? '6' : '3'}
                                </span>
                            </div>

                            <div className='first-run-title-div hasBg'>
                                Coins To Level Up
                                <span>
                                    <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                                    {levelThresholds[level] ? levelThresholds[level].toLocaleString() : '1M'}
                                </span>
                            </div>

                            <div className='first-run-title-div hasBg'>
                                Profit Per Hour
                                <span>
                                    <img src={FTNCoin} className='little-icon' alt="Coin Icon" />
                                    +{tokensPerHour.toFixed(2)}
                                </span>
                            </div>
                        </span>

                        <div className='first-run-total-coins'>
                            <img className='large-icon' src={FTNCoin} alt="Large Coin Icon" />
                            <span className='coins-count'>{Math.floor(tokens).toLocaleString()}</span>
                        </div>

                        <span className='progress-bar-level-container'>
                            <span className='level-container'>
                                <span>Rookie</span>
                                <span>Level {level}/10</span>
                            </span>
                            <span className='progress-bar-container'>
                                <span className='progress-bar' style={{ width: `${progress}%` }}></span>
                            </span>
                        </span>

                        <div className='tap-container' onClick={handleCollectTokens}>
                            <img src={Tap} className='tap-img' alt="Tap to collect tokens" />
                        </div>

                        <div className='under-tap-container'>
                            <div>
                                <img src={Boost} className={`bottom-tap-img ${boostActive ? 'active' : ''}`} alt="Boost" onClick={handleUseBoost} />
                                <span>Boost</span>
                            </div>

                            <div>
                                <img src={Energy} className='bottom-tap-img' alt="Energy" />
                                <span>{energy}/4500</span>
                            </div>
                        </div>
                    </>
                )}
                {currentPage === 'Markets' && 
                    <Markets 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        tokens={tokens} 
                        setTokens={setTokens} 
                        setTokensPerHour={setTokensPerHour} 
                        tokensPerHour={tokensPerHour}
                        upgrades={upgrades}
                        setUpgrades={setUpgrades}
                    />
                }

                <div className='navigation'>
                    <div className='navigation-inner'>
                        <div className='navigationColumn' onClick={() => setCurrentPage('Home')}>
                            <div className='navigationIconHolder'>
                                <i className="navigationIcon icon-flash"></i>
                            </div>
                            Home
                        </div>

                        <div className='navigationColumn' onClick={() => setCurrentPage('Markets')}>
                            <div className='navigationIconHolder'>
                                <i className="navigationIcon boost-flash"></i>
                            </div>
                            Markets
                        </div>

                        <div className='navigationColumn'>
                            <div className='navigationIconHolder'>
                                <i className="navigationIcon bomb-flash"></i>
                            </div>
                            Quiz
                        </div>

                        <div className='navigationColumn'>
                            <div className='navigationIconHolder'>
                                <i className="navigationIcon friends-flash"></i>
                            </div>
                            Friends
                        </div>

                        <div className='navigationColumn'>
                            <div className='navigationIconHolder'>
                                <i className="navigationIcon roadmap-flash"></i>
                            </div>
                            Roadmap
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirstRunGame;
