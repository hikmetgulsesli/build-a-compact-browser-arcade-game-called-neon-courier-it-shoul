import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Direction, GameState, GridPoint, RuntimeActions, RuntimeBridge } from '../types/domain';
import { loadHighScore, saveHighScore } from '../utils/storage';

const GRID_SIZE = 7;
const ROUND_SECONDS = 75;
const START_POINT: GridPoint = { x: 3, y: 3 };

const firstJob = {
  pickup: { x: 1, y: 1 },
  dropoff: { x: 5, y: 5 },
  carried: false,
  delivered: 0,
};

function samePoint(a: GridPoint, b: GridPoint) {
  return a.x === b.x && a.y === b.y;
}

function clamp(value: number) {
  return Math.max(0, Math.min(GRID_SIZE - 1, value));
}

function nextJob(delivered: number) {
  const offset = delivered % 3;
  return {
    pickup: { x: (1 + offset * 2) % GRID_SIZE, y: (5 - offset) % GRID_SIZE },
    dropoff: { x: (5 - offset * 2 + GRID_SIZE) % GRID_SIZE, y: (1 + offset * 2) % GRID_SIZE },
    carried: false,
    delivered,
  };
}

function createInitialState(): GameState {
  const storedHighScore = loadHighScore();

  return {
    view: 'menu',
    status: 'idle',
    paused: false,
    gameOver: false,
    isPaused: false,
    isGameOver: false,
    score: 0,
    highScore: storedHighScore.value,
    secondsLeft: ROUND_SECONDS,
    player: START_POINT,
    direction: 'right',
    job: firstJob,
    message: storedHighScore.lastError ?? 'Ready for dispatch',
    storageStatus: storedHighScore.storageStatus,
    lastError: storedHighScore.lastError,
    gridSize: GRID_SIZE,
  };
}

function resetState(highScore: number): GameState {
  return {
    ...createInitialState(),
    view: 'playing',
    status: 'running',
    paused: false,
    gameOver: false,
    isPaused: false,
    isGameOver: false,
    highScore,
    message: 'Collect the neon package',
  };
}

export function useAppState(): RuntimeBridge {
  const [state, setState] = useState<GameState>(() => createInitialState());

  const finishIfNeeded = useCallback((score: number, highScore: number) => {
    const nextHighScore = Math.max(score, highScore);
    const saveResult = saveHighScore(nextHighScore);
    return { nextHighScore, saveResult };
  }, []);

  const startGame = useCallback(() => {
    setState((current) => resetState(current.highScore));
  }, []);

  const resumeGame = useCallback(() => {
    setState((current) => {
      if (current.status === 'ended') {
        return current;
      }

      return {
        ...current,
        view: 'playing',
        status: 'running',
        paused: false,
        gameOver: false,
        isPaused: false,
        isGameOver: false,
        message: current.job.carried ? 'Reach the drop zone' : 'Collect the neon package',
      };
    });
  }, []);

  const pauseGame = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      return {
        ...current,
        view: 'paused',
        status: 'paused',
        paused: true,
        gameOver: false,
        isPaused: true,
        isGameOver: false,
        message: 'Courier paused',
      };
    });
  }, []);

  const openMenu = useCallback(() => {
    setState((current) => ({
      ...current,
      view: 'menu',
      status: current.status === 'running' ? 'paused' : current.status,
      paused: current.status === 'running' || current.status === 'paused',
      gameOver: current.status === 'ended',
      isPaused: current.status === 'running' || current.status === 'paused',
      message: 'Ready for dispatch',
    }));
  }, []);

  const openHelp = useCallback(() => {
    setState((current) => ({
      ...current,
      view: 'help',
      status: current.status === 'running' ? 'paused' : current.status,
      paused: current.status === 'running' || current.status === 'paused',
      gameOver: current.status === 'ended',
      isPaused: current.status === 'running' || current.status === 'paused',
      message: 'Use arrows or touch controls',
    }));
  }, []);

  const move = useCallback((direction: Direction) => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      const delta = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
      }[direction];

      return {
        ...current,
        direction,
        player: {
          x: clamp(current.player.x + delta.x),
          y: clamp(current.player.y + delta.y),
        },
      };
    });
  }, []);

  const pickupOrDropoff = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      if (!current.job.carried && samePoint(current.player, current.job.pickup)) {
        return {
          ...current,
          job: { ...current.job, carried: true },
          score: current.score + 25,
          message: 'Package secured',
        };
      }

      if (current.job.carried && samePoint(current.player, current.job.dropoff)) {
        const delivered = current.job.delivered + 1;
        const score = current.score + 100 + current.secondsLeft;
        return {
          ...current,
          score,
          highScore: Math.max(score, current.highScore),
          secondsLeft: Math.min(ROUND_SECONDS, current.secondsLeft + 12),
          job: nextJob(delivered),
          message: 'Delivery complete',
        };
      }

      return {
        ...current,
        message: current.job.carried ? 'Find the drop zone' : 'Find the package pickup',
      };
    });
  }, []);

  const tick = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      if (current.secondsLeft <= 1) {
        const { nextHighScore, saveResult } = finishIfNeeded(current.score, current.highScore);
        return {
          ...current,
          view: 'gameOver',
          status: 'ended',
          paused: false,
          gameOver: true,
          isPaused: false,
          isGameOver: true,
          secondsLeft: 0,
          highScore: nextHighScore,
          storageStatus: saveResult.storageStatus,
          lastError: saveResult.lastError,
          message: saveResult.lastError ?? 'Shift complete',
        };
      }

      return { ...current, secondsLeft: current.secondsLeft - 1 };
    });
  }, [finishIfNeeded]);

  const actions = useMemo<RuntimeActions>(
    () => ({
      startGame,
      resumeGame,
      pauseGame,
      restartGame: startGame,
      openHelp,
      openMenu,
      move,
      pickupOrDropoff,
      tick,
    }),
    [move, openHelp, openMenu, pauseGame, pickupOrDropoff, resumeGame, startGame, tick],
  );

  useEffect(() => {
    if (state.score >= state.highScore) {
      const saveResult = saveHighScore(state.highScore);

      if (saveResult.lastError) {
        setState((current) => ({
          ...current,
          storageStatus: saveResult.storageStatus,
          lastError: saveResult.lastError,
          message: saveResult.lastError ?? current.message,
        }));
      }
    }
  }, [state.highScore, state.score]);

  return { state, actions };
}
