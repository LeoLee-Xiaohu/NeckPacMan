# NeckPacMan

Static prototype for a webcam-controlled Pac-Man concept.

## Local preview

Because the app uses ES modules, serve it over HTTP instead of opening `index.html`
directly from disk.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages deployment

This repo is configured for automated GitHub Pages deployment from the `main`
branch using `.github/workflows/deploy-pages.yml`.

Expected live URL:

`https://leolee-xiaohu.github.io/NeckPacMan/`

To enable it in GitHub:

1. Push this branch to `main`.
2. In the GitHub repository, open `Settings -> Pages`.
3. Under `Source`, select `GitHub Actions`.
4. Wait for the `Deploy static site to GitHub Pages` workflow to complete.

## MediaPipe asset loading

GitHub Pages serves the site over HTTPS, which is required for webcam access in
normal browser contexts and avoids mixed-content issues for model downloads.

When TASK-010 adds MediaPipe files, keep model loading web-safe:

- Prefer same-origin relative paths such as `./assets/mediapipe/...`.
- If using CDN-hosted MediaPipe assets, use `https://` URLs only.
- Do not test model loading from `file://`, because module imports and webcam
  permissions will not reflect production behavior.
