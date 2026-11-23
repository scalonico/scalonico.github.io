# Personal Website

Static personal website for Sebastian Calonico, published with GitHub Pages at
https://scalonico.github.io/. There is no build step: pushing to `main` publishes the site.

## Files

- `index.html` is the home page (bio and an interactive regression discontinuity plot).
- `research.html` (working papers), `publications.html`, `software.html`, and `teaching.html` are the section pages.
- `contact.html` and the `standard-*.html` files are redirects that keep earlier page URLs working.
- `site.css` contains the styling. `site.js` sets the footer year, opens folded lists for find-in-page, and draws the home page plot.
- `analytics.js` loads Google Analytics.
- `photo.jpg` and `favicon.svg` are the portrait and the browser-tab icon.
- `CV/resume.tex` is the CV source.
- `.nojekyll` tells GitHub Pages to serve the site directly as static files.

## Updating the site

- Every page repeats the same side column and top menu, so a change to either means editing all five pages.
- After changing `site.css` or `site.js`, raise the `?v=` number on both in all five pages so browsers fetch the new file.
- Add files to a commit by name. Do not use `git add .`: this folder can hold private documents that must not be published.

## Updating the CV

1. Edit `CV/resume.tex`.
2. Run `pdflatex resume.tex` twice in `CV/`.
3. Copy `CV/resume.pdf` to `CV/Calonico_CV.pdf`, which keeps an older link working.
