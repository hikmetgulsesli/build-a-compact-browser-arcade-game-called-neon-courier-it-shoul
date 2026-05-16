// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Game Board
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state
import { useMemo, useState } from "react";

export type GameBoardActionId = "pause-1" | "restart-2";

export interface GameBoardProps {
  actions?: Partial<Record<GameBoardActionId, () => void>>;
}

const boardActiveCells = new Set([0, 11, 17, 22, 33, 34, 44, 51, 55, 66, 68, 77, 84, 87]);
const miniActiveCells = new Set([0, 5, 10, 15]);

export function GameBoard({ actions }: GameBoardProps) {
  const [score, setScore] = useState(12400);
  const [level, setLevel] = useState(6);
  const [progress, setProgress] = useState(48);
  const boardCells = useMemo(() => Array.from({ length: 96 }, (_, index) => boardActiveCells.has(index)), []);
  const miniCells = useMemo(() => Array.from({ length: 16 }, (_, index) => miniActiveCells.has(index)), []);

  const handlePause = () => {
    actions?.["pause-1"]?.();
  };

  const handleRestart = () => {
    setScore(0);
    setLevel(1);
    setProgress(0);
    actions?.["restart-2"]?.();
  };

  return (
    <>
      <header>
          <div><div className="meta">Neon Courier delivery run</div><h1>Game Board</h1><p>Guide the courier through the neon grid, pick up the package, and reach the drop zone before the timer expires.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-game-board">
            <section className="game-layout" aria-label="Playable board reference">
              <div className="board" role="grid" aria-label="Playable game field">{boardCells.map((isActive, index) => <div className={isActive ? "cell active" : "cell"} aria-hidden={true} key={index}></div>)}</div>
              <aside className="side-panel">
                <h2>Status</h2>
                <div className="mini-grid" aria-label="Gameplay status preview">{miniCells.map((isActive, index) => <span className={isActive ? "active" : ""} key={index}></span>)}</div>
                <dl><dt>Score</dt><dd>{score.toLocaleString("en-US")}</dd><dt>Level</dt><dd>{level}</dd><dt>Progress</dt><dd>{progress}%</dd></dl>
                <button type="button" data-action-id="pause-1" onClick={handlePause}>Pause</button><button type="button" data-action-id="restart-2" onClick={handleRestart}>Restart</button>
              </aside>
            </section></main>
    </>
  );
}
