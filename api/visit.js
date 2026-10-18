// Vercel serverless function: /api/visit
// Stores visits in a file `visits.json` in this repository using the GitHub Contents API.
// Requirements: set environment variable GITHUB_TOKEN (repo scope) in your Vercel project.

const OWNER = 'Farruxi';
const REPO = 'e2e.uz-';
const PATH = 'visits.json';

export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  // determine visitor IP (Vercel sets x-forwarded-for)
  const ip = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();

  if(!GITHUB_TOKEN){
    // Persistent counter not available. Return a helpful error with IP only.
    res.status(500).json({ error: 'GITHUB_TOKEN not set in environment. Set it in Vercel to enable persistent visit counter. See README.', ip });
    return;
  }

  const apiBase = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`;
  const headers = {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'visit-counter'
  };

  try{
    // GET current file (if exists)
    let getResp = await fetch(apiBase, { headers });
    if(getResp.status === 404){
      // create new file
      const initial = { count: 1, visitors: [{ ip, at: new Date().toISOString() }] };
      const content = Buffer.from(JSON.stringify(initial, null, 2)).toString('base64');
      const putResp = await fetch(apiBase, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Initialize visits.json', content }) });
      if(!putResp.ok){
        const txt = await putResp.text();
        res.status(500).json({ error: 'Failed to create visits.json', detail: txt });
        return;
      }
      res.status(200).json({ count: 1, ip });
      return;
    }

    if(!getResp.ok){
      const txt = await getResp.text();
      res.status(500).json({ error: 'Failed to read visits.json', detail: txt });
      return;
    }

    const file = await getResp.json();
    const sha = file.sha;
    const decoded = Buffer.from(file.content, 'base64').toString('utf8');
    let data = {};
    try{ data = JSON.parse(decoded); } catch(e){ data = { count:0, visitors:[] }; }

    data.count = (data.count || 0) + 1;
    data.visitors = data.visitors || [];
    data.visitors.push({ ip, at: new Date().toISOString() });
    // keep last 200 entries to avoid huge file
    if(data.visitors.length > 200) data.visitors = data.visitors.slice(-200);

    const newContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
    const putResp = await fetch(apiBase, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Increment visit count', content: newContent, sha }) });
    if(!putResp.ok){
      const txt = await putResp.text();
      res.status(500).json({ error: 'Failed to update visits.json', detail: txt });
      return;
    }

    res.status(200).json({ count: data.count, ip });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'unexpected error', detail: err.message || err, ip });
  }
}
