# NeckPacMan

NeckPacMan is a webcam-controlled Pac-Man style browser game. Instead of using a
keyboard as the main control method, the player guides Pac-Man through the maze
with head movement.

The goal is to make a short neck-movement exercise feel like a simple arcade
game: look left, right, up, or down to steer Pac-Man, collect dots, and try to
reach the winning score.

## How the Game Works

1. Open the game in a browser.
2. Allow camera access when prompted.
3. Look straight at the camera during calibration.
4. Move your head to guide Pac-Man through the maze:
   - Look left to move left.
   - Look right to move right.
   - Look up to move up.
   - Look down to move down.
5. Eat dots to gain points.
6. Win when your score reaches 1800 points.

Keyboard controls are also available for testing:

- `Arrow keys`
- `W`, `A`, `S`, `D`

## Game Objective

Each dot is worth 10 points. The victory condition is:

```text
Reach 1800 points
```

The game also ends in victory if all dots in the maze are collected.

## Player Experience

The game screen is kept clear so players can see the maze, dots, and Pac-Man
without obstruction. The camera preview sits outside the game area and shows the
face tracking status separately.

## Local Preview

Because the app uses ES modules and browser camera APIs, serve it over HTTP
instead of opening `index.html` directly from disk.

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Use `localhost` for local testing. Browsers allow webcam access on
`http://localhost`, but usually block camera access on insecure non-local HTTP
origins.

## Deployment

This is a static site and can be deployed with GitHub Pages.

Detailed deployment steps are documented here:

[docs/deployment.md](docs/deployment.md)

Expected GitHub Pages URL:

```text
https://leolee-xiaohu.github.io/NeckPacMan/
```

## Tech Stack

- HTML5 Canvas for game rendering
- JavaScript ES modules for game logic
- MediaPipe Face Mesh for head tracking
- GitHub Pages for static hosting
