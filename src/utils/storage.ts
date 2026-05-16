const HIGH_SCORE_KEY = 'neon-courier-high-score';

export function loadHighScore(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const stored = window.localStorage.getItem(HIGH_SCORE_KEY);
  const value = stored ? Number.parseInt(stored, 10) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function saveHighScore(score: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(HIGH_SCORE_KEY, String(Math.max(0, score)));
}
