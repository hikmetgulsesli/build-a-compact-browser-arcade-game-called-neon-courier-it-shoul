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
  return {
    view: 'menu',
    status: 'idle',
    score: 0,
    highScore: loadHighScore(),
    secondsLeft: ROUND_SECONDS,
    player: START_POINT,
    direction: 'right',
    job: firstJob,
    message: 'Ready for dispatch',
    gridSize: GRID_SIZE,
  };
}

function resetState(highScore: number): GameState {
  return {
    ...createInitialState(),
    view: 'playing',
    status: 'running',
    highScore,
    message: 'Collect the neon package',
  };
}

export function useAppState(): RuntimeBridge {
  const [state, setState] = useState<GameState>(() => createInitialState());

  const finishIfNeeded = useCallback((score: number, highScore: number) => {
    const nextHighScore = Math.max(score, highScore);
    saveHighScore(nextHighScore);
    return nextHighScore;
  }, []);

  const startGame = useCallback(() => {
    setState((current) => resetState(current.highScore));
  }, []);

  const resumeGame = useCallback(() => {
    setState((current) => ({
      ...current,
      view: 'playing',
      status: current.status === 'ended' ? 'ended' : 'running',
      message: current.job.carried ? 'Reach the drop zone' : 'Collect the neon package',
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setState((current) => {
      if (current.status !== 'running') {
        return current;
      }

      return { ...current, view: 'paused', status: 'paused', message: 'Courier paused' };
    });
  }, []);

  const openMenu = useCallback(() => {
    setState((current) => ({
      ...current,
      view: 'menu',
      status: current.status === 'running' ? 'paused' : current.status,
      message: 'Ready for dispatch',
    }));
  }, []);

  const openHelp = useCallback(() => {
    setState((current) => ({
      ...current,
      view: 'help',
      status: current.status === 'running' ? 'paused' : current.status,
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
        const highScore = finishIfNeeded(current.score, current.highScore);
        return {
          ...current,
          view: 'gameOver',
          status: 'ended',
          secondsLeft: 0,
          highScore,
          message: 'Shift complete',
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
      saveHighScore(state.highScore);
    }
  }, [state.highScore, state.score]);

  return { state, actions };
}
