// src/components/Games.tsx
import React, { useState } from 'react';
import firstrun from '../../assets/games/firstrun.jpg';
import spaceexplorer from '../../assets/games/space-explorer.png';
import puzzlemaster from '../../assets/games/puzzle-master.png';
import treasurehunter from '../../assets/games/treasure-hunter.png';
import zombieslayer from '../../assets/games/zombie-slayer.png';
import farmtycoon from '../../assets/games/farm-tycoon.png';
import racinglegend from '../../assets/games/racing-legend.png';
import './Games.css';
import FirstRunGame from './FirstRun/FirstRunGame'; // Импорт компонента игры

interface Game {
  id: number;
  name: string;
  icon: string;
  isInDevelopment: boolean;
}

const gamesList: Game[] = [
  { id: 1, name: 'First Run', icon: firstrun, isInDevelopment: false },
  { id: 2, name: 'Space Explorer', icon: spaceexplorer, isInDevelopment: true },
  { id: 3, name: 'Puzzle Master', icon: puzzlemaster, isInDevelopment: true },
  { id: 4, name: 'Treasure Hunter', icon: treasurehunter, isInDevelopment: true },
  { id: 5, name: 'Zombie Slayer', icon: zombieslayer, isInDevelopment: true },
  { id: 6, name: 'Farm Tycoon', icon: farmtycoon, isInDevelopment: true },
  { id: 7, name: 'Racing Legend', icon: racinglegend, isInDevelopment: true },
];

const Games: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const openGame = (game: Game) => {
    if (game.isInDevelopment) {
      setWarning(`${game.name} is in development and not available for launch yet.`);
    } else {
      setSelectedGame(game);
    }
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  const closeWarning = () => {
    setWarning(null);
  };

  return (
    <div className="page-container">
      <div className="games-container">
        <div className="games-list">
          {gamesList.map((game) => (
            <div
              key={game.id}
              className={`game-item ${game.isInDevelopment ? 'disabled' : ''}`}
              onClick={() => openGame(game)}
            >
              <img src={game.icon} alt={game.name} className="game-icon" />
              <p>{game.name}</p>
            </div>
          ))}
        </div>

        {selectedGame && selectedGame.name === 'First Run' && (
          <FirstRunGame onClose={closeGame} />
        )}

        {selectedGame && selectedGame.name !== 'First Run' && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-button" onClick={closeGame}>
                X
              </button>
              <h2>{selectedGame.name}</h2>
              <div className="game-app">
                <p>Launching game: {selectedGame.name}</p>
              </div>
            </div>
          </div>
        )}

        {warning && (
          <div className="modal">
            <div className="modal-content">
              <button className="close-button" onClick={closeWarning}>
                X
              </button>
              <h2>WARNING</h2>
              <span className="error-container">
                <div className="circle-border"></div>
                <div className="circle">
                  <div className="error"></div>
                </div>
              </span>
              <p>{warning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;
