# Deploying NeckPacMan to GitHub Pages

This project is a static browser game. It does not need a backend or a build
step. GitHub Pages can serve it directly from the repository using the existing
GitHub Actions workflow:

`/.github/workflows/deploy-pages.yml`

The deployed site URL for this repository should be:

`https://leolee-xiaohu.github.io/NeckPacMan/`

## Before You Start

Make sure you have:

1. A GitHub account.
2. Access to the `LeoLee-Xiaohu/NeckPacMan` repository.
3. Git installed locally.
4. The latest project files committed on your local machine.

## 1. Test the Game Locally

Do not open `index.html` directly from Finder. The game uses ES modules and
webcam APIs, so preview it through a local HTTP server.

From the project root:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000/
```

Check that:

1. The start screen appears.
2. The browser asks for camera permission.
3. The game canvas loads.
4. The camera preview appears outside the game area.
5. Pac-Man can move and collect dots.

Stop the local server with `Control + C` when finished.

## 2. Commit Your Changes

Check which files changed:

```bash
git status
```

Stage the files you want to deploy:

```bash
git add index.html css/styles.css js/main.js js/ui.js docs/deployment.md
```

Commit them:

```bash
git commit -m "Update game UI and deployment docs"
```

If you changed other files, include them in the `git add` command as needed.

## 3. Push to GitHub

Push the `main` branch:

```bash
git push origin main
```

The repository already has a workflow that deploys whenever `main` receives a
new push.

## 4. Enable GitHub Pages

This only needs to be done once per repository.

1. Open the repository on GitHub:

   `https://github.com/LeoLee-Xiaohu/NeckPacMan`

2. Click `Settings`.

3. In the left sidebar, click `Pages`.

4. Under `Build and deployment`, find `Source`.

5. Select `GitHub Actions`.

6. Save the setting if GitHub shows a save button.

After this, GitHub will use `.github/workflows/deploy-pages.yml` to publish the
site.

## 5. Wait for the Deployment Workflow

1. Open the repository's `Actions` tab.
2. Click `Deploy static site to GitHub Pages`.
3. Open the latest workflow run.
4. Wait until the workflow shows a green success check.

The workflow uploads the whole repository as a static site artifact and deploys
it to GitHub Pages.

## 6. Open the Live Game

After the workflow succeeds, open:

```text
https://leolee-xiaohu.github.io/NeckPacMan/
```

Use the HTTPS URL. Webcam access is normally blocked on insecure non-local
origins, and GitHub Pages provides HTTPS for the published site.

## 7. Deploy Future Updates

For later changes, repeat only these steps:

```bash
git status
git add <changed-files>
git commit -m "Describe the update"
git push origin main
```

Every push to `main` starts a new GitHub Pages deployment.

## Troubleshooting

### The site shows a 404 page

Wait a few minutes after the first successful deployment. If it still shows 404:

1. Confirm `Settings -> Pages -> Source` is set to `GitHub Actions`.
2. Confirm the latest `Actions` deployment succeeded.
3. Confirm the URL is exactly:

   `https://leolee-xiaohu.github.io/NeckPacMan/`

### The game loads but the camera does not work

Check that you opened the HTTPS GitHub Pages URL, not an HTTP URL.

Also check the browser permission prompt. If camera permission was denied,
re-enable camera access in the browser site settings and reload the page.

### The latest changes are not visible

1. Confirm your changes were pushed to `main`.
2. Confirm the latest workflow run completed successfully.
3. Hard refresh the browser page.
4. Try opening the page in a private/incognito window to avoid cached files.

### The workflow fails

Open the failed workflow run in the `Actions` tab and read the failing step.
For this project, the most important workflow file is:

`.github/workflows/deploy-pages.yml`

The workflow should use:

1. `actions/checkout`
2. `actions/configure-pages`
3. `actions/upload-pages-artifact`
4. `actions/deploy-pages`

If one of those actions was edited incorrectly, restore the workflow before
deploying again.

## References

- GitHub Docs: Configuring a publishing source for GitHub Pages
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Docs: Using custom workflows with GitHub Pages
  https://docs.github.com/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
