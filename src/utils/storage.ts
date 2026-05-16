const HIGH_SCORE_KEY = 'neon-courier-high-score';

export interface HighScoreLoadResult {
  value: number;
  storageStatus: 'ready' | 'recovered' | 'unavailable' | 'error';
  lastError: string | null;
}

export interface HighScoreSaveResult {
  storageStatus: 'ready' | 'unavailable' | 'error';
  lastError: string | null;
}

export function loadHighScore(): HighScoreLoadResult {
  if (typeof window === 'undefined') {
    return {
      value: 0,
      storageStatus: 'unavailable',
      lastError: 'Local storage is unavailable.',
    };
  }

  try {
    const stored = window.localStorage.getItem(HIGH_SCORE_KEY);

    if (!stored) {
      return { value: 0, storageStatus: 'ready', lastError: null };
    }

    const value = Number(stored);

    if (Number.isInteger(value) && value >= 0) {
      return { value: Math.max(0, value), storageStatus: 'ready', lastError: null };
    }

    window.localStorage.setItem(HIGH_SCORE_KEY, '0');
    return {
      value: 0,
      storageStatus: 'recovered',
      lastError: 'High score data was corrupted and reset.',
    };
  } catch {
    return {
      value: 0,
      storageStatus: 'error',
      lastError: 'High score storage could not be read.',
    };
  }
}

export function saveHighScore(score: number): HighScoreSaveResult {
  if (typeof window === 'undefined') {
    return {
      storageStatus: 'unavailable',
      lastError: 'Local storage is unavailable.',
    };
  }

  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(Math.max(0, score)));
    return { storageStatus: 'ready', lastError: null };
  } catch {
    return {
      storageStatus: 'error',
      lastError: 'High score storage could not be saved.',
    };
  }
}
