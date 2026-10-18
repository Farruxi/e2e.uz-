// Vercel serverless function: /api/visit
// Stores only a numeric lifetime visit counter in `visits.json` in the repository using the GitHub Contents API.
// This version DOES NOT store visitor IPs. It returns the current visitor IP in the response but does not persist it.
// Requirements: set environment variable GITHUB_TOKEN (repo scope) in your Vercel project.

const OWNER = 'Farruxi';
const REPO = 'e2e.uz-';
const PATH = 'visits.json';

export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  // determine visitor IP (Vercel sets x-forwarded-for)
  const ip = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

  if(!GITHUB_TOKEN){
    // Graceful fallback so the site still renders and the user sees a clean state.
    // The counter will work once GITHUB_TOKEN is configured in Vercel.
    res.status(200).json({ count: 0, ip, warning: 'GITHUB_TOKEN not configured in Vercel yet.' });
    return;
  }

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'visit-counter'
  };

  try{
    let getResp = await fetch(apiBase, { headers });
    if(getResp.status === 404){
      const initial = { count: 1 };
      const content = Buffer.from(JSON.stringify(initial, null, 2)).toString('base64');
      const putResp = await fetch(apiBase, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Initialize visits.json', content }) });
      if(!putResp.ok){
        const txt = await putResp.text();
        res.status(200).json({ count: 0, ip, warning: 'Counter not ready yet: could not initialize visits.json.', detail: txt });
        return;
      }
      res.status(200).json({ count: 1, ip });
      return;
    }

    if(!getResp.ok){
      const txt = await getResp.text();
      res.status(200).json({ count: 0, ip, warning: 'Counter could not be loaded yet.', detail: txt });
      return;
    }

    const file = await getResp.json();
    const sha = file.sha;
    const decoded = Buffer.from(file.content, 'base64').toString('utf8');
    let data = {};
    try{ data = JSON.parse(decoded); } catch(e){ data = { count:0 }; }

    data.count = (data.count || 0) + 1;

    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const putResp = await fetch(apiBase, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Increment visit count', content: newContent, sha }) });
    if(!putResp.ok){
      const txt = await putResp.text();
      res.status(200).json({ count: data.count || 0, ip, warning: 'The counter updated locally but GitHub write failed.', detail: txt });
      return;
    }

    res.status(200).json({ count: data.count, ip });
  } catch(err){
    console.error(err);
    res.status(200).json({ count: 0, ip, warning: 'Counter failed unexpectedly; please check Vercel deployment and environment variables.' });
  }
}
