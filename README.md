Simplified site: keep only a large, centered "END-TO-END" headline and optimize for desktop & mobile.

Files:
- index.html (single, static page)
- styles.css (responsive typography, safe-area support)
- script.js (empty)

Preview locally:
1. Clone the repo.
2. In the repository root run: python3 -m http.server 8000
3. Open http://localhost:8000

Deploy:
- Vercel: Import the repo, no build step.
- Cloudflare Pages: Create a Pages project, set framework to "None (Static HTML)", output directory '/'.
