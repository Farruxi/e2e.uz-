Add a visit counter API and client integration.

How it works
- The front-end (script.js) calls GET /api/visit on page load.
- /api/visit is a Vercel Serverless Function (api/visit.js) that reads and updates a file visits.json in the repository using the GitHub Contents API.
- Each request increments a lifetime counter and records the visitor IP and timestamp (keeps last 200 entries).

Security & deployment notes
- You MUST set a GITHUB_TOKEN environment variable in your Vercel project with permission to read/write the repository contents (repo scope for private repos, or public_repo for public repos).
  - On Vercel: go to Project Settings → Environment Variables → Add GITHUB_TOKEN with your Personal Access Token.
- The function will commit a new visits.json to the repo on first run and on each update. This creates commits — expect history growth.

Privacy
- The API records visitor IP addresses and stores them in visits.json. Displaying IPs may have privacy/legal implications depending on your audience and jurisdiction.
- If you don't want to store IPs, remove the visitors array push in api/visit.js.

Alternative (Cloudflare Pages / Workers)
- If you deploy on Cloudflare Workers, use Workers KV or Durable Objects to store the counter. That approach is more robust and doesn't create repo commits. I can prepare a Worker version if you'd like.

How to enable on Vercel
1. Push these changes to the repo (already done).
2. In your Vercel project settings create an environment variable named GITHUB_TOKEN and set it to a Personal Access Token with `repo` (or `public_repo`) scope.
3. Redeploy the site.

How to view raw stored data
- After deployment (and at least one visit) a file `visits.json` will appear in the repository root containing the counter and recent visitors.

If you'd like I can:
- Remove visitor IP storage and only keep a numeric count.
- Swap out GitHub storage for a Cloudflare Worker + KV implementation (recommended for production).
- Add a privacy notice on the page before showing the visitor IP.
