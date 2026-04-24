# NeckPac — Neck Exercise Pac-Man Game

## Product Requirements Document (PRD) — v1.0 POC

---

## 1. Overview

**Product Name:** NeckPac

**Tagline:** Exercise your neck, eat the dots.

**Summary:** A browser-based Pac-Man style game controlled entirely by head movements via webcam. Designed to help desk workers relieve neck stiffness through fun, short gaming sessions. This document covers the **v1.0 POC** — a minimal, playable version to validate the core concept.

---

## 2. Problem Statement

Prolonged desk work leads to neck stiffness, pain, and long-term cervical spine issues. Existing solutions (stretching apps, reminder timers) are boring and easy to ignore. There is an opportunity to **gamify neck exercises** so users actually want to do them.

---

## 3. Target Users

| Persona | Description |
|---|---|
| **Desk Worker** | Office/remote worker spending 6+ hrs/day at a computer. Experiences occasional neck pain. |
| **Developer/Designer** | Tech-savvy, likely to discover and share a browser game. Comfortable with webcam permissions. |

---

## 4. Goals & Success Criteria (POC)

| Goal | Success Metric |
|---|---|
| Validate head-tracking controls feel responsive and intuitive | Users can navigate the maze without frustration (qualitative feedback) |
| Confirm the game encourages varied neck movement | All 4 directions (up/down/left/right) are used during a session |
| Playable end-to-end in a browser | Game loads, runs, and scores correctly on Chrome/Edge |
| Session length appropriate for a work break | Average game session lasts 1–3 minutes |

---

## 5. Scope

### 5.1 In Scope (v1.0 POC)

| Feature | Description |
|---|---|
| **Webcam Head Tracking** | Detect head direction (up/down/left/right) using MediaPipe or TensorFlow.js face detection. |
| **Single Fixed Maze** | One hand-crafted maze layout (classic Pac-Man style grid). |
| **Pac-Man Movement** | Player character moves through the maze based on detected head direction. Continuous movement in the last detected direction. |
| **Dots (Pellets)** | Small dots placed in all open corridors. Eating a dot increases the score by 10 points. |
| **Score Display** | Current score shown on screen during gameplay. |
| **Win Condition** | Player wins by eating all dots on the maze. Display a "You Win!" screen with final score. |
| **Calibration Step** | Brief "look at the camera" prompt at start to establish the neutral head position. |
| **Start / Restart** | Simple start screen with instructions. Restart button after game ends. |
| **Responsive Canvas** | Game renders on an HTML Canvas, sized to fit common screen sizes. |

### 5.2 Out of Scope (v1.0 — future versions)

| Feature | Reason Deferred |
|---|---|
| Ghosts / Enemies | Adds complexity; POC focuses on movement + collection |
| Power pellets | Requires ghost AI to be meaningful |
| Multiple levels / procedural mazes | One maze is enough to validate the concept |
| Leaderboard / accounts | No backend for POC |
| Mobile support | Head tracking works best on desktop webcam |
| Sound effects / music | Nice-to-have, not essential for POC |
| Difficulty settings | Single difficulty for simplicity |
| Analytics / telemetry | Not needed for POC validation |

---

## 6. User Flow

```
┌─────────────┐
│  Landing     │  "NeckPac — Exercise your neck, eat the dots"
│  Page        │  [Start Game] button
└─────┬───────┘
      │ click
      ▼
┌─────────────┐
│  Camera      │  Browser requests webcam permission
│  Permission  │  If denied → show error message
└─────┬───────┘
      │ granted
      ▼
┌─────────────┐
│  Calibration │  "Look straight at the camera"
│  (3 sec)     │  Establishes neutral head position
└─────┬───────┘
      │ ready
      ▼
┌─────────────┐
│  Gameplay    │  Pac-Man in maze, head controls movement
│              │  Score updates as dots are eaten
└─────┬───────┘
      │ all dots eaten
      ▼
┌─────────────┐
│  Win Screen  │  "You Win! Score: XXX"
│              │  [Play Again] button
└─────────────┘
```

---

## 7. Technical Architecture

### 7.1 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Game Rendering** | HTML5 Canvas | Simple, no dependencies, good performance for 2D grid |
| **Game Logic** | Vanilla JavaScript (ES Modules) | Minimal bundle, fast load, easy to prototype |
| **Head Tracking** | MediaPipe Face Mesh (via CDN) | Lightweight, accurate, runs in-browser with WebGL |
| **Styling** | CSS (minimal) | Just for layout of canvas + UI overlays |
| **Deployment** | Static files (GitHub Pages / Vercel) | Zero backend, instant deploy |

### 7.2 Project Structure

```
neck-pac/
├── index.html          # Entry point, canvas + UI
├── css/
│   └── style.css       # Layout and overlay styles
├── js/
│   ├── main.js         # Game initialization and loop
│   ├── game.js         # Game state, maze, collision, scoring
│   ├── player.js       # Pac-Man entity (position, direction, rendering)
│   ├── maze.js         # Maze layout data and rendering
│   ├── tracker.js      # Webcam + MediaPipe head direction detection
│   └── ui.js           # Start screen, win screen, score display
├── assets/
│   └── (empty for POC — use canvas-drawn graphics)
└── README.md           # Setup and play instructions
```

### 7.3 Head Tracking Logic

```
1. Initialize webcam stream → video element (hidden)
2. Load MediaPipe Face Mesh model
3. On each frame:
   a. Detect face landmarks
   b. Calculate head pose (yaw = left/right, pitch = up/down)
   c. Compare to calibrated neutral position
   d. If delta exceeds threshold → emit direction event
4. Direction events feed into game input system
```

**Thresholds (tunable):**
| Movement | Angle Delta from Neutral |
|---|---|
| Look Left | yaw < -15° |
| Look Right | yaw > +15° |
| Look Up | pitch < -10° |
| Look Down | pitch > +10° |

---

## 8. Maze Design (v1.0)

A simple 21×21 grid (classic size). Walls represented as `1`, paths as `0`, dots auto-placed on all path cells.

```
Example (simplified 9×9):

1 1 1 1 1 1 1 1 1
1 0 0 0 1 0 0 0 1
1 0 1 0 0 0 1 0 1
1 0 0 0 1 0 0 0 1
1 1 0 1 1 1 0 1 1
1 0 0 0 1 0 0 0 1
1 0 1 0 0 0 1 0 1
1 0 0 0 1 0 0 0 1
1 1 1 1 1 1 1 1 1

P = Player start (center)
```

---

## 9. Game Mechanics

| Mechanic | Detail |
|---|---|
| **Movement** | Pac-Man moves continuously in the current direction at a fixed speed. Turning happens when a new head direction is detected AND the turn is valid (no wall). |
| **Speed** | Fixed at ~4 cells/second (tunable for comfort). |
| **Collision** | Wall collision stops movement in that direction; player must look in a valid direction to continue. |
| **Dot Collection** | When Pac-Man's position overlaps a dot cell, the dot is removed and score increases by 10. |
| **Win** | All dots collected → game ends → show win screen. |
| **No Lose Condition** | POC has no enemies, so the player cannot lose. This is intentional — the goal is neck exercise, not frustration. |

---

## 10. UI / Visual Design (POC)

Keep it minimal — canvas-drawn, no image assets needed.

| Element | Visual |
|---|---|
| **Pac-Man** | Yellow circle with animated mouth (wedge cutout) |
| **Walls** | Dark blue filled rectangles |
| **Dots** | Small white circles |
| **Background** | Black |
| **Score** | White text, top-left corner of canvas |
| **Camera preview** | Small video feed in corner (optional, helps user see their head position) |

---

## 11. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Frame Rate** | 30+ FPS gameplay; head tracking at 15+ FPS |
| **Load Time** | < 5 seconds on broadband (model download may add 2-3s first load) |
| **Browser Support** | Chrome 90+, Edge 90+ (WebRTC + WebGL required) |
| **Privacy** | Camera feed processed 100% client-side. No video data sent to any server. |
| **Accessibility** | High-contrast default colors. Large, readable score text. |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Head tracking latency feels sluggish | Poor UX, users give up | Tune thresholds; allow keyboard fallback for testing |
| Low-light webcam = bad detection | Game unplayable | Show warning if face not detected for 3+ seconds |
| Users unsure how to move | Confusion at start | Add brief animated tutorial on start screen |
| MediaPipe CDN unavailable | Game won't load | Bundle model files locally as fallback |

---

## 13. Future Roadmap (Post-POC)

| Version | Features |
|---|---|
| **v1.1** | Add 1–2 ghost enemies with simple AI (random movement) |
| **v1.2** | Power pellets, ghost vulnerability phase |
| **v1.3** | Multiple maze levels, increasing difficulty |
| **v2.0** | Leaderboard, daily streaks, exercise stats tracking |
| **v2.1** | Mobile support (front camera), sound effects |
| **v3.0** | Multiplayer (race to clear maze), custom mazes |

---

## 14. Definition of Done (POC)

- [ ] Game loads in Chrome with a single HTML file entry point
- [ ] Webcam permission requested and handled (grant + deny paths)
- [ ] Head calibration completes in ≤ 5 seconds
- [ ] Head movements (4 directions) reliably control Pac-Man
- [ ] Pac-Man navigates the maze, collects dots, score updates
- [ ] Win screen displays when all dots are eaten
- [ ] Play Again restarts the game cleanly
- [ ] No server-side dependencies — fully static deployment
- [ ] README with setup instructions

---

*Document Version: 1.0 | Created: 2026-04-24 | Status: Draft*
