// script.js - calls /api/visit to get lifetime visits and the visitor IP
(async function(){
  const visitsEl = document.getElementById('visits');
  const ipEl = document.getElementById('ip');

  try{
    const res = await fetch('/api/visit');
    if(!res.ok){
      const txt = await res.text();
      visitsEl.textContent = 'error';
      ipEl.textContent = 'error';
      console.warn('visit API error:', txt);
      return;
    }
    const data = await res.json();
    visitsEl.textContent = data.count ?? '—';
    ipEl.textContent = data.ip ?? '—';
  }catch(err){
    visitsEl.textContent = 'error';
    ipEl.textContent = 'error';
    console.error(err);
  }
})();
