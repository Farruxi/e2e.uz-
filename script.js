// script.js - subtle procedural veil and interaction for an eerie beyond-human feeling
(function(){
  const canvas = document.getElementById('veil');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, t = 0;

  function resize(){
    w = canvas.width = innerWidth * devicePixelRatio;
    h = canvas.height = innerHeight * devicePixelRatio;
    canvas.style.width = innerWidth+'px';
    canvas.style.height = innerHeight+'px';
    ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // procedural subtle noise lines
  function draw(){
    t += 0.005;
    ctx.clearRect(0,0,innerWidth,innerHeight);

    // soft vertical bands
    for(let i=0;i<6;i++){
      const x = (innerWidth/6)*i + (Math.sin(t*30 + i)*10);
      const wband = innerWidth/12;
      const alpha = 0.04 + 0.02*Math.sin(t*10 + i);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x + wband*0.6, innerHeight*0.5, wband, innerHeight*0.6, Math.sin(i+t)*0.2, 0, Math.PI*2);
      ctx.fill();
    }

    // drifting stripes
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    for(let s=0;s<14;s++){
      const y = (s/14)*innerHeight + Math.sin(t*3 + s)*18;
      ctx.fillStyle = `rgba(0,0,0,${0.01 + 0.005*Math.cos(s + t*5)})`;
      ctx.fillRect(0,y,innerWidth,2 + Math.abs(Math.sin(s + t))*4);
    }
    ctx.restore();

    // occasional quick glitch flash
    if(Math.random() < 0.004){
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(Math.random()*innerWidth*0.6, Math.random()*innerHeight, Math.random()*innerWidth*0.4, 2 + Math.random()*60);
    }

    requestAnimationFrame(draw);
  }

  // subtle mouse parallax on title
  const title = document.getElementById('title');
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e)=>{
    const nx = (e.clientX / innerWidth - 0.5) * 2;
    const ny = (e.clientY / innerHeight - 0.5) * 2;
    mx = nx; my = ny;
    title.style.transform = `translate3d(${mx*0.6}vmin, ${my*0.6}vmin, 0) scale(${1 + Math.abs(mx)*0.002})`;
  }, {passive:true});

  // small slow breathing for accessibility
  let breath = 0;
  function pulse(){
    breath += 0.02;
    const s = 1 + Math.sin(breath)*0.002;
    title.style.letterSpacing = 1 + Math.sin(breath*0.8)*0.08 + 'vmin';
    requestAnimationFrame(pulse);
  }

  // startup shimmer: SVG filter animation via class toggle
  function startup(){
    document.body.classList.add('seen');
  }

  draw(); pulse(); startup();
})();
