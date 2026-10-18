END-TO-END minimal static site

This repository contains a minimal, monochrome, eerie landing page designed to be deployed as a static site on Vercel or Cloudflare Pages.

Files added:
- index.html
- styles.css
- script.js

How to deploy

Vercel:
1. Go to https://vercel.com and import this GitHub repository.
2. Vercel will detect it as a static site. No build step is required.
3. Set the root to `/` and deploy.

Cloudflare Pages:
1. Go to https://dash.cloudflare.com/pages and create a new project from GitHub.
2. Select this repository. Build settings: Framework "None (Static HTML)". Build command: leave empty. Build output directory: `/`.
3. Deploy.

Customization

- Edit the title text in index.html (currently "END-TO-END").
- Adjust animation and intensity in script.js and styles.css.

Notes

- The design intentionally uses only black and white values and a clean serif headline.
- If you want a different font or to host fonts locally, replace the Google Fonts link in index.html.
