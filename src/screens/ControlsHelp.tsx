// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Controls Help
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state
import { useState } from "react";

export type ControlsHelpActionId = "start-game-1" | "resume-2" | "open-settings-3";

export interface ControlsHelpProps {
  actions?: Partial<Record<ControlsHelpActionId, () => void>>;
}

const controlGroups = [
  {
    title: "Keyboard",
    details: "Arrow keys or WASD move the courier. Space picks up a package at the depot or drops it at the delivery bay.",
  },
  {
    title: "Touch",
    details: "Use the on-screen directional pad on phones and tablets, then tap Pickup / Drop when the courier reaches a target.",
  },
  {
    title: "Run Control",
    details: "Pause freezes the timer, Restart resets the route, and the HUD keeps score, time, package status, and best run visible.",
  },
];

const deliveryTips = [
  "Collect the package before heading to the drop-off marker.",
  "Every completed delivery adds score and starts the next route.",
  "Watch the timer and choose short paths through the neon grid.",
];

export function ControlsHelp({ actions }: ControlsHelpProps) {
  const [lastAction, setLastAction] = useState("Choose a route action");
  const [settingsStatus, setSettingsStatus] = useState("Settings panel status: closed");

  const handleAction = (actionId: ControlsHelpActionId, label: string) => {
    setLastAction(label);
    if (actionId === "open-settings-3") {
      setSettingsStatus("Settings panel status: open request shown on Controls Help");
    }
    actions?.[actionId]?.();
  };

  return (
    <>
      <header>
          <div><div className="meta">Neon Courier</div><h1>Controls Help</h1><p>Keyboard, touch, pickup, drop-off, pause, restart, timer, and score reference.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-controls-help">
          <section className="command-panel">
            <p>Deliver packages across the compact city grid before time runs out. Keep moving, collect from the pickup marker, and drop off at the destination marker.</p>
            <div className="action-row"><button type="button" data-action-id="start-game-1" onClick={() => handleAction("start-game-1", "Start Game selected")}>Start Game</button><button type="button" data-action-id="resume-2" onClick={() => handleAction("resume-2", "Resume selected")}>Resume</button><button type="button" data-action-id="open-settings-3" onClick={() => handleAction("open-settings-3", "Open Settings selected")}>Open Settings</button></div>
            <div className="data-grid"><article><h2>Controls</h2>{controlGroups.map((group) => (<p key={group.title}><strong>{group.title}:</strong> {group.details}</p>))}</article><article><h2>Courier Rules</h2><p aria-live="polite">{lastAction}</p><p aria-live="polite">{settingsStatus}</p>{deliveryTips.map((tip) => (<p key={tip}>{tip}</p>))}</article></div>
          </section></main>
    </>
  );
}
