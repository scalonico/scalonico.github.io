# Personal Website

This repository contains a static personal website for Sebastian Calonico. It is designed for GitHub Pages and does not require a build step.

## Files

- `index.html` contains the page structure and content.
- `styles.css` contains the visual design and responsive layout.
- `script.js` adds the footer year and active navigation highlighting.
- `.nojekyll` tells GitHub Pages to serve the site directly as static files.

## Best GitHub Setup

The cleanest option is to create a repository named `scalonico.github.io`. If you do that, the site will publish at:

`https://scalonico.github.io/`

If you use a different repository name, GitHub Pages will publish it at a project URL such as:

`https://scalonico.github.io/repository-name/`

## Exact Commands

Run these from this folder after creating the GitHub repository:

```powershell
git init -b main
git add .
git commit -m "Initial personal website"
git remote add origin https://github.com/scalonico/scalonico.github.io.git
git push -u origin main
```

If the repository already exists and was initialized on GitHub with a README or license, use:

```powershell
git init -b main
git add .
git commit -m "Initial personal website"
git remote add origin https://github.com/scalonico/scalonico.github.io.git
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## GitHub Pages Settings

1. Open the repository on GitHub.
2. Go to `Settings`.
3. Click `Pages`.
4. Under `Build and deployment`, choose `Deploy from a branch`.
5. Select branch `main`.
6. Select folder `/ (root)`.
7. Click `Save`.

GitHub usually publishes within a minute or two. The live URL for a user site repository should be:

`https://scalonico.github.io/`

## Suggested Next Edits

- Replace the selected publications with your preferred shortlist.
- Add a headshot if you want a more personal landing page.
- Add teaching, advising, or service sections if you want the site to function as a fuller academic profile.
