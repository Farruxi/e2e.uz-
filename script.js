// script.js - Stupid dino-like runner. More fun, more stupid features.
(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const msgEl = document.getElementById('message');
  const btnStart = document.getElementById('btn-start');
  const btnReset = document.getElementById('btn-reset');

  let W = canvas.width = canvas.clientWidth;
  let H = canvas.height = canvas.clientHeight;
  const DPR = window.devicePixelRatio || 1;
  canvas.width = W * DPR; canvas.height = H * DPR; ctx.scale(DPR, DPR);

  let running = false;
  let gameOver = false;
  let speed = 3; // world speed
  let frame = 0;
  let score = 0;
  let obstacles = [];
  let powerups = [];

  // player
  const player = {
    x: 40,
    y: H - 32,
    w: 28,
    h: 28,
    vy: 0,
    grounded: true,
    scale: 1,
    draw(){
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.fillRect(this.x, this.y - this.h*this.scale, this.w*this.scale, this.h*this.scale);
      // silly eyes
      ctx.fillStyle = '#fff';
      ctx.fillRect(this.x + 6*this.scale, this.y - this.h*this.scale + 6*this.scale, 6*this.scale, 6*this.scale);
      ctx.fillRect(this.x + 18*this.scale - 6*this.scale, this.y - this.h*this.scale + 6*this.scale, 6*this.scale, 6*this.scale);
      ctx.restore();
    }
  };

  function spawnObstacle(){
    const typ = Math.random() < 0.6 ? 'cactus' : (Math.random()<0.5? 'banana' : 'toilet');
    const h = typ === 'cactus' ? 28 + Math.random()*20 : (typ==='banana'?18:34);
    obstacles.push({x: W + 20, w: typ==='toilet'?34:18, h, typ});
  }

  function spawnPowerup(){
    const kind = Math.random()<0.6? 'big' : 'tiny';
    powerups.push({x: W + 20, y: H - 60 - Math.random()*60, kind, taken:false});
  }

  function reset(){
    running = false; gameOver = false; speed = 3; frame = 0; score = 0; obstacles = []; powerups = [];
    player.y = H - 32; player.vy = 0; player.grounded = true; player.scale = 1;
    scoreEl.textContent = '0';
    msgEl.textContent = 'Press Start or Space to begin — be stupider.';
    draw();
  }

  function start(){
    if(running) return;
    running = true; gameOver = false; msgEl.textContent = 'Go!';
    loop();
  }

  function gameOverFn(){
    running = false; gameOver = true; msgEl.textContent = `Game Over — score ${Math.floor(score) } — ENDT-TO-END`;
    playTone(80,0.07);
  }

  function jump(){
    if(gameOver) return;
    if(player.grounded){
      player.vy = -8 - Math.random()*3; player.grounded = false; playTone(600 + Math.random()*200, 0.05);
    } else {
      // double-flap: small extra boost sometimes
      if(Math.random() < 0.18){ player.vy -= 3; playTone(900,0.03); }
    }
  }

  // simple beep using WebAudio
  const AC = window.AudioContext ? new AudioContext() : null;
  function playTone(freq, dur){
    if(!AC) return;
    const o = AC.createOscillator();
    const g = AC.createGain();
    o.type = 'square'; o.frequency.value = freq;
    g.gain.value = 0.02;
    o.connect(g); g.connect(AC.destination);
    o.start();
    setTimeout(()=>{ o.stop(); }, dur*1000);
  }

  function update(dt){
    frame++;
    // spawn obstacles
    if(frame % Math.max(10, Math.floor(90 - Math.min(score/5, 70))) === 0){
      spawnObstacle();
    }
    if(frame % 600 === 0 && Math.random() < 0.7) spawnPowerup();

    // update obstacles
    for(let i=obstacles.length-1;i>=0;i--){
      const o = obstacles[i]; o.x -= speed;
      if(o.x + o.w < -50) obstacles.splice(i,1);
      // collision
      const py1 = player.y - player.h*player.scale;
      const py2 = player.y;
      const ox1 = o.x; const ox2 = o.x + o.w;
      if(ox2 > player.x && ox1 < player.x + player.w*player.scale && py2 > (H - o.h)){
        // hit
        gameOverFn();
      }
    }

    // powerups
    for(let i=powerups.length-1;i>=0;i--){
      const p = powerups[i]; p.x -= speed;
      if(p.x < -40) powerups.splice(i,1);
      // pickup
      if(!p.taken && p.x < player.x + player.w && p.x + 24 > player.x && player.y > p.y){
        p.taken = true;
        if(p.kind === 'big'){ player.scale = 1.7; playTone(300,0.2); setTimeout(()=>player.scale = 1, 4000);} else { player.scale = 0.6; playTone(1200,0.12); setTimeout(()=>player.scale = 1, 4000);} 
        powerups.splice(i,1);
      }
    }

    // physics
    if(!player.grounded){
      player.vy += 0.4; player.y += player.vy;
      if(player.y >= H - 32){ player.y = H - 32; player.vy = 0; player.grounded = true; }
    }

    // scoring and speedup
    if(running) score += 0.1 * (1 + speed/6);
    if(Math.floor(score) % 100 === 0 && Math.floor(score) !== 0){
      // milestone silly message
      msgEl.textContent = ['lol nice','very stupid','beyond human','supreme jump'][Math.floor(score/100)%4];
    }
    speed = 3 + Math.min(score/300, 6);
    scoreEl.textContent = Math.floor(score);

    // occasional random gag: spawn a giant toilet
    if(Math.random() < 0.0008) { obstacles.push({x: W + 40, w: 60, h: 46, typ:'toilet'}); }
  }

  function draw(){
    // clear
    ctx.clearRect(0,0,W,H);
    // ground
    ctx.fillStyle = '#000';
    ctx.fillRect(0, H - 8, W, 8);

    // horizon dots (like chrome)
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for(let i=0;i<20;i++){
      ctx.fillRect( i * 40 + ((frame*speed)%40), H - 10 - (i%2)*4, 6, 2);
    }

    // draw obstacles
    for(const o of obstacles){
      ctx.save();
      ctx.fillStyle = '#000';
      const oy = H - o.h;
      if(o.typ === 'cactus'){
        ctx.fillRect(o.x, oy, o.w, o.h);
        // tiny arms
        ctx.fillRect(o.x - 4, oy + 6, 4, 4);
        ctx.fillRect(o.x + o.w, oy + 10, 4, 4);
      } else if(o.typ === 'banana'){
        ctx.beginPath(); ctx.arc(o.x + o.w/2, oy + o.h/2, o.h/2, 0.25*Math.PI, 1.25*Math.PI); ctx.fill();
      } else if(o.typ === 'toilet'){
        ctx.fillRect(o.x, oy, o.w, o.h);
        ctx.fillStyle = '#fff'; ctx.fillRect(o.x + 6, oy + 8, o.w - 12, o.h - 16);
      }
      ctx.restore();
    }

    // powerups
    for(const p of powerups){
      ctx.save();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(p.x - 3, p.y - 2, 6, 4);
      ctx.restore();
    }

    // player
    player.draw();

    // UI overlays
    if(gameOver){
      ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillRect(W/2 - 160, H/2 - 40, 320, 80);
      ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.font = '20px Inter'; ctx.fillText('GAME OVER — CLICK TO RESTART', W/2, H/2 + 6);
      ctx.restore();
    }
  }

  function loop(){
    if(!running) return;
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // input
  window.addEventListener('keydown', (e)=>{ if(e.code === 'Space') { e.preventDefault(); if(!running) start(); jump(); } });
  canvas.addEventListener('click', (e)=>{ if(!running) start(); if(gameOver){ reset(); } else jump(); });
  document.getElementById('btn-start').addEventListener('click', ()=>{ start(); });
  document.getElementById('btn-reset').addEventListener('click', ()=>{ reset(); });

  // resize handling
  function onResize(){
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
    player.y = H - 32; draw();
  }
  window.addEventListener('resize', onResize);

  // initial draw
  reset();

})();
