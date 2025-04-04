"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "~/components/ui/button";
import { DEGEN_TIPS_URL, LIVES_PER_DAY } from "~/lib/constants";

// Game constants
const GRID_SIZE = 15;
const CELL_SIZE = 15;
const GAME_SPEED = 150;
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

type Position = {
  x: number;
  y: number;
};

type Direction = typeof DIRECTIONS.UP | typeof DIRECTIONS.DOWN | 
                 typeof DIRECTIONS.LEFT | typeof DIRECTIONS.RIGHT;

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showDegenLink, setShowDegenLink] = useState(false);
  
  // Game state refs to avoid closure issues in event handlers and intervals
  const snakeRef = useRef<Position[]>([{ x: 7, y: 7 }]);
  const directionRef = useRef<Direction>(DIRECTIONS.RIGHT);
  const foodRef = useRef<Position>({ x: 5, y: 5 });
  const gameLoopRef = useRef<number | null>(null);

  // Load lives from localStorage on component mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('snakeGameLives');
    
    if (storedData) {
      const { date, remainingLives } = JSON.parse(storedData);
      
      // Reset lives if it's a new day
      if (date === today) {
        setLives(remainingLives);
      } else {
        setLives(LIVES_PER_DAY);
        saveRemainingLives(LIVES_PER_DAY);
      }
    } else {
      setLives(LIVES_PER_DAY);
      saveRemainingLives(LIVES_PER_DAY);
    }
  }, []);

  const saveRemainingLives = (remainingLives: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('snakeGameLives', JSON.stringify({
      date: today,
      remainingLives
    }));
  };

  const getRandomFoodPosition = useCallback((): Position => {
    const position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Make sure food doesn't appear on snake
    const isOnSnake = snakeRef.current.some(
      segment => segment.x === position.x && segment.y === position.y
    );
    
    if (isOnSnake) {
      return getRandomFoodPosition();
    }
    
    return position;
  }, []);

  const resetGame = useCallback(() => {
    snakeRef.current = [{ x: 7, y: 7 }];
    directionRef.current = DIRECTIONS.RIGHT;
    foodRef.current = getRandomFoodPosition();
    setScore(0);
    setGameOver(false);
    setShowDegenLink(false);
  }, [getRandomFoodPosition]);

  const endGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    setGameOver(true);
    setGameStarted(false);
    setShowDegenLink(true);
    
    // Decrease lives and save to localStorage
    const newLives = lives - 1;
    setLives(newLives);
    saveRemainingLives(newLives);
  }, [lives]);
  
  const updateGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Move snake
    const head = { ...snakeRef.current[0] };
    head.x += directionRef.current.x;
    head.y += directionRef.current.y;
    
    // Check for collisions
    if (
      head.x < 0 || 
      head.x >= GRID_SIZE || 
      head.y < 0 || 
      head.y >= GRID_SIZE ||
      snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      endGame();
      return;
    }
    
    // Add new head
    snakeRef.current.unshift(head);
    
    // Check if snake ate food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Increase score
      setScore(prevScore => prevScore + 1);
      
      // Generate new food
      foodRef.current = getRandomFoodPosition();
    } else {
      // Remove tail if no food was eaten
      snakeRef.current.pop();
    }
    
    // Draw snake
    ctx.fillStyle = '#4ade80'; // Green color for snake
    snakeRef.current.forEach(segment => {
      ctx.fillRect(
        segment.x * CELL_SIZE, 
        segment.y * CELL_SIZE, 
        CELL_SIZE, 
        CELL_SIZE
      );
    });
    
    // Draw food (degen hat)
    ctx.fillStyle = '#000000'; // Black for hat base
    ctx.fillRect(
      foodRef.current.x * CELL_SIZE, 
      foodRef.current.y * CELL_SIZE, 
      CELL_SIZE, 
      CELL_SIZE - 3
    );
    
    // Hat brim
    ctx.fillRect(
      (foodRef.current.x * CELL_SIZE) - 2, 
      (foodRef.current.y * CELL_SIZE) + (CELL_SIZE - 3), 
      CELL_SIZE + 4, 
      3
    );
  }, [endGame, getRandomFoodPosition]);
  
  const startGame = useCallback(() => {
    if (lives <= 0) {
      setShowDegenLink(true);
      return;
    }
    
    resetGame();
    setGameStarted(true);
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = window.setInterval(() => {
      updateGame();
    }, GAME_SPEED);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [lives, resetGame, updateGame]);


  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== DIRECTIONS.DOWN) {
            directionRef.current = DIRECTIONS.UP;
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== DIRECTIONS.UP) {
            directionRef.current = DIRECTIONS.DOWN;
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== DIRECTIONS.RIGHT) {
            directionRef.current = DIRECTIONS.LEFT;
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== DIRECTIONS.LEFT) {
            directionRef.current = DIRECTIONS.RIGHT;
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted]);

  // Handle touch controls for mobile
  const handleDirectionButton = (direction: Direction) => {
    if (!gameStarted) return;
    
    // Prevent moving in opposite direction
    if (
      (direction === DIRECTIONS.UP && directionRef.current === DIRECTIONS.DOWN) ||
      (direction === DIRECTIONS.DOWN && directionRef.current === DIRECTIONS.UP) ||
      (direction === DIRECTIONS.LEFT && directionRef.current === DIRECTIONS.RIGHT) ||
      (direction === DIRECTIONS.RIGHT && directionRef.current === DIRECTIONS.LEFT)
    ) {
      return;
    }
    
    directionRef.current = direction;
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 text-sm">
        Score: {score} | Lives: {lives}
      </div>
      
      <canvas
        ref={canvasRef}
        width={GRID_SIZE * CELL_SIZE}
        height={GRID_SIZE * CELL_SIZE}
        className="border border-gray-300 bg-gray-100 dark:bg-gray-800"
      />
      
      {!gameStarted && (
        <div className="mt-2">
          {lives > 0 ? (
            <Button onClick={startGame} className="w-full">
              {gameOver ? "Try Again" : "Start Game"}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm mb-2">No more lives today!</p>
              <Button onClick={() => window.open(DEGEN_TIPS_URL, '_blank')} className="w-full">
                Visit Degen Tips
              </Button>
            </div>
          )}
        </div>
      )}
      
      {gameStarted && (
        <div className="mt-2 grid grid-cols-3 gap-1">
          <div></div>
          <Button 
            size="sm" 
            onClick={() => handleDirectionButton(DIRECTIONS.UP)}
            className="p-1"
          >
            ↑
          </Button>
          <div></div>
          
          <Button 
            size="sm" 
            onClick={() => handleDirectionButton(DIRECTIONS.LEFT)}
            className="p-1"
          >
            ←
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleDirectionButton(DIRECTIONS.DOWN)}
            className="p-1"
          >
            ↓
          </Button>
          <Button 
            size="sm" 
            onClick={() => handleDirectionButton(DIRECTIONS.RIGHT)}
            className="p-1"
          >
            →
          </Button>
        </div>
      )}
      
      {showDegenLink && (
        <div className="mt-4 text-center">
          <p className="text-sm mb-2">Learn more about Degen!</p>
          <Button 
            variant="outline" 
            onClick={() => window.open(DEGEN_TIPS_URL, '_blank')}
            className="text-xs"
          >
            Visit www.degen.tips
          </Button>
        </div>
      )}
    </div>
  );
}
