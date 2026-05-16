import { useEffect } from 'react';
import { ControlsHelp, GameBoard, GameOver, MainMenu, PauseOverlay } from './screens';
import { useAppState } from './hooks/useAppState';
import type { Direction, RuntimeBridge } from './types/domain';
import './App.css';

const keyDirection: Record<string, Direction> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
};

function publishRuntimeBridge(bridge: RuntimeBridge) {
  window.app = bridge;
  globalThis.app = bridge;
}

export default function App() {
  const app = useAppState();
  const { state, actions } = app;

  useEffect(() => {
    publishRuntimeBridge(app);
  }, [app]);

  useEffect(() => {
    if (state.status !== 'running') {
      return undefined;
    }

    const timer = window.setInterval(actions.tick, 1000);
    return () => window.clearInterval(timer);
  }, [actions.tick, state.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = keyDirection[event.key];

      if (direction) {
        event.preventDefault();
        actions.move(direction);
        return;
      }

      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        actions.pickupOrDropoff();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        state.status === 'running' ? actions.pauseGame() : actions.resumeGame();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [actions, state.status]);

  const cells = Array.from({ length: state.gridSize * state.gridSize }, (_, index) => {
    const point = { x: index % state.gridSize, y: Math.floor(index / state.gridSize) };
    const isPlayer = point.x === state.player.x && point.y === state.player.y;
    const isPickup = !state.job.carried && point.x === state.job.pickup.x && point.y === state.job.pickup.y;
    const isDropoff = point.x === state.job.dropoff.x && point.y === state.job.dropoff.y;

    return (
      <div
        className={[
          'neon-cell',
          isPlayer ? 'is-player' : '',
          isPickup ? 'is-pickup' : '',
          isDropoff ? 'is-dropoff' : '',
        ].join(' ')}
        key={`${point.x}-${point.y}`}
      >
        {isPlayer ? 'C' : isPickup ? 'P' : isDropoff ? 'D' : ''}
      </div>
    );
  });

  const menuActions = {
    'start-game-1': actions.startGame,
    'resume-2': actions.resumeGame,
    'open-settings-3': actions.openHelp,
  };

  const boardActions = {
    'pause-1': actions.pauseGame,
    'restart-2': actions.restartGame,
  };

  const pauseActions = {
    'play-again-1': actions.resumeGame,
    'share-score-2': actions.openHelp,
    'main-menu-3': actions.openMenu,
  };

  return (
    <main className="neon-app" data-setfarm-root="neon-courier">
      {state.view === 'menu' && <MainMenu actions={menuActions} />}
      {state.view === 'help' && <ControlsHelp actions={menuActions} />}
      {(state.view === 'playing' || state.view === 'paused') && <GameBoard actions={boardActions} />}
      {state.view === 'gameOver' && <GameOver actions={boardActions} />}
      {state.view === 'paused' && <PauseOverlay actions={pauseActions} />}

      <section className="courier-panel" aria-label="Neon Courier game state">
        <div className="hud">
          <span>Score {state.score}</span>
          <span>Time {state.secondsLeft}s</span>
          <span>Best {state.highScore}</span>
        </div>

        <div className="status-line">{state.message}</div>

        <div className="neon-grid" role="grid" aria-label="Courier delivery grid">
          {cells}
        </div>

        <div className="touch-pad" aria-label="Touch controls">
          <button type="button" onClick={() => actions.move('up')} aria-label="Move up">
            Up
          </button>
          <button type="button" onClick={() => actions.move('left')} aria-label="Move left">
            Left
          </button>
          <button type="button" onClick={actions.pickupOrDropoff}>
            Pickup / Drop
          </button>
          <button type="button" onClick={() => actions.move('right')} aria-label="Move right">
            Right
          </button>
          <button type="button" onClick={() => actions.move('down')} aria-label="Move down">
            Down
          </button>
        </div>
      </section>
    </main>
  );
}
