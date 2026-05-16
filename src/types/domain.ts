export type GameView = 'menu' | 'help' | 'playing' | 'paused' | 'gameOver';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GridPoint {
  x: number;
  y: number;
}

export interface DeliveryJob {
  pickup: GridPoint;
  dropoff: GridPoint;
  carried: boolean;
  delivered: number;
}

export interface GameState {
  view: GameView;
  status: 'idle' | 'running' | 'paused' | 'ended';
  score: number;
  highScore: number;
  secondsLeft: number;
  player: GridPoint;
  direction: Direction;
  job: DeliveryJob;
  message: string;
  gridSize: number;
}

export interface RuntimeActions {
  startGame: () => void;
  resumeGame: () => void;
  pauseGame: () => void;
  restartGame: () => void;
  openHelp: () => void;
  openMenu: () => void;
  move: (direction: Direction) => void;
  pickupOrDropoff: () => void;
  tick: () => void;
}

export interface RuntimeBridge {
  state: GameState;
  actions: RuntimeActions;
}

declare global {
  interface Window {
    app: RuntimeBridge;
  }

  var app: RuntimeBridge;
}
