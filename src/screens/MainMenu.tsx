// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Main Menu
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state
import { useEffect, useState } from "react";

export type MainMenuActionId = "start-game-1" | "resume-2" | "open-settings-3";

export interface MainMenuProps {
  actions?: Partial<Record<MainMenuActionId, () => void>>;
}

export function MainMenu({ actions }: MainMenuProps) {
  const [lastRun, setLastRun] = useState("Best route: 4 deliveries in 90 seconds");
  const [controlMode] = useState("Arrow keys, WASD, Space, and touch controls");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        actions?.["start-game-1"]?.();
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(event.key)) {
        setLastRun("Courier ready: press Space or Enter to launch the delivery run");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions]);

  return (
    <>
      <header>
          <div><div className="meta">Neon Courier dispatch</div><h1>Main Menu</h1><p>Choose a run, resume delivery, or review controls before entering the city grid.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-main-menu">
          <section className="command-panel">
            <p>Load the courier bay, watch the timer, and complete pickup and drop-off routes for the highest score.</p>
            <div className="action-row"><button type="button" data-action-id="start-game-1" onClick={actions?.["start-game-1"]}>Start Game</button><button type="button" data-action-id="resume-2" onClick={actions?.["resume-2"]}>Resume</button><button type="button" data-action-id="open-settings-3" onClick={actions?.["open-settings-3"]}>Open Settings</button></div>
            <div className="data-grid"><article><h2>Goal</h2><p>{lastRun}</p></article><article><h2>Controls</h2><p>{controlMode}</p></article></div>
          </section></main>
    </>
  );
}
