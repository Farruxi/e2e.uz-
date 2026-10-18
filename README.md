Visit counter (Vercel)

This site shows a lifetime visit counter and the current visitor's IP in the browser. IMPORTANT: the server does NOT store visitor IPs — only a numeric lifetime counter is persisted.

How it works
- The front-end calls GET /api/visit on page load.
- /api/visit is a Vercel Serverless Function (api/visit.js) that reads and updates a file `visits.json` in the repository using the GitHub Contents API.
- Each request increments a lifetime numeric counter. The function returns the current visitor's IP in the API response but does not persist it.

visits.json example (stored in repo after first visit):
{
  "count": 42
}

Requirements for Vercel deployment
1. Create a Personal Access Token (PAT) in GitHub with `public_repo` scope (for public repo) or `repo` scope (for private repo).
2. In your Vercel project settings, add an Environment Variable named `GITHUB_TOKEN` and set it to the PAT.
3. Redeploy the site on Vercel.

Privacy notes
- This implementation does NOT store raw IPs. Only the numeric counter is stored in `visits.json`.
- The API response returns the current visitor IP so the page can display it, but the IP is not written to the repository.
- If you want further privacy measures (hashing, rate-limiting, or not returning the IP at all), I can adjust it.

Alternatives
- For production and higher scale, consider using Cloudflare Workers + KV or a small database (Supabase, Vercel KV) to avoid committing updates to the git history on every visit.

If you want, I can also:
- Switch to a Worker + KV implementation and push that code.
- Add a short privacy notice on the site before showing the IP.
