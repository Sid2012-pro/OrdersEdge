const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault(); });
window.addEventListener('keyup',   e => { keys[e.code] = false; });

// ═══════════════════════════════════════════
//  8 CHARACTERS
// ═══════════════════════════════════════════
const characters = [
  { id:0, short:'ANAKIN',  name:'Anakin Skywalker', role:'JEDI KNIGHT',
    color:'#3af', saber:'#3af', type:'jedi',
    hp:120, fp:100, spd:6,   jump:-13, dmg:28, stats:{PWR:4,SPD:3,DEF:3} },
  { id:1, short:'AHSOKA',  name:'Ahsoka Tano',      role:'PADAWAN',
    color:'#0fb', saber:'#0fb', type:'jedi',
    hp:90,  fp:110, spd:8,   jump:-15, dmg:22, stats:{PWR:3,SPD:5,DEF:2} },
  { id:2, short:'OBI-WAN', name:'Obi-Wan Kenobi',   role:'JEDI MASTER',
    color:'#6cf', saber:'#6cf', type:'jedi',
    hp:110, fp:120, spd:5.5, jump:-12, dmg:24, stats:{PWR:3,SPD:3,DEF:5} },
  { id:3, short:'MACE',    name:'Mace Windu',        role:'JEDI MASTER',
    color:'#a4f', saber:'#a4f', type:'jedi',
    hp:130, fp:90,  spd:5,   jump:-11, dmg:36, stats:{PWR:5,SPD:2,DEF:4} },
  { id:4, short:'REX',     name:'Captain Rex',       role:'ARC TROOPER',
    color:'#bcd', saber:null,   type:'clone',
    hp:150, fp:60,  spd:5.5, jump:-11, dmg:15, stats:{PWR:3,SPD:3,DEF:5} },
  { id:5, short:'CODY',    name:'Commander Cody',    role:'CLONE CMDR',
    color:'#fa6', saber:null,   type:'clone',
    hp:140, fp:60,  spd:4.5, jump:-10, dmg:12, stats:{PWR:2,SPD:2,DEF:5} },
  { id:6, short:'KIT',     name:'Kit Fisto',         role:'JEDI MASTER',
    color:'#3c9', saber:'#3c9', type:'jedi',
    hp:105, fp:105, spd:6.5, jump:-13, dmg:26, stats:{PWR:3,SPD:4,DEF:3} },
  { id:7, short:'PLO',     name:'Plo Koon',          role:'JEDI MASTER',
    color:'#f84', saber:'#f84', type:'jedi',
    hp:115, fp:115, spd:5,   jump:-12, dmg:30, stats:{PWR:4,SPD:2,DEF:4} },
];

// ═══════════════════════════════════════════
//  LEVELS
// ═══════════════════════════════════════════
const levels = [
  { id:0, name:'GEONOSIS ARENA', info:'4 HOSTILES · SECTOR 1',
    bg:'#2d0f06', fc:'#7a3018', ec:'#c04a22',
    plats:[
      {x:-50,  y:480, w:900, h:40},
      {x:80,   y:360, w:190, h:16},
      {x:350,  y:275, w:160, h:16},
      {x:590,  y:340, w:190, h:16},
      {x:210,  y:195, w:130, h:16},
      {x:510,  y:185, w:120, h:16},
    ],
    enemies:[
      {x:320, y:440, t:'b1'},
      {x:510, y:440, t:'b1'},
      {x:660, y:300, t:'sniper'},
      {x:730, y:440, t:'b2'},
    ]
  },
  { id:1, name:'KAMINO PLATFORMS', info:'4 HOSTILES · SECTOR 2',
    bg:'#0c1825', fc:'#1e3d5c', ec:'#3a7aaa',
    plats:[
      {x:-50,  y:480, w:200, h:40},
      {x:220,  y:480, w:160, h:40},
      {x:460,  y:480, w:160, h:40},
      {x:700,  y:480, w:200, h:40},
      {x:70,   y:370, w:120, h:16},
      {x:280,  y:300, w:110, h:16},
      {x:470,  y:220, w:110, h:16},
      {x:660,  y:310, w:130, h:16},
    ],
    enemies:[
      {x:260, y:440, t:'sniper'},
      {x:600, y:440, t:'b1'},
      {x:730, y:440, t:'b2'},
      {x:480, y:180, t:'sniper'},
    ]
  },
  { id:2, name:'CORUSCANT UNDERWORLD', info:'5 HOSTILES · SECTOR 3',
    bg:'#070812', fc:'#161630', ec:'#3040a0',
    plats:[
      {x:-50,  y:480, w:900, h:40},
      {x:50,   y:390, w:110, h:16},
      {x:230,  y:320, w:100, h:16},
      {x:400,  y:250, w:120, h:16},
      {x:580,  y:310, w:110, h:16},
      {x:690,  y:210, w:130, h:16},
      {x:120,  y:210, w:110, h:16},
      {x:310,  y:145, w:90,  h:16},
    ],
    enemies:[
      {x:220, y:440, t:'b2'},
      {x:420, y:440, t:'b1'},
      {x:620, y:440, t:'b2'},
      {x:710, y:170, t:'sniper'},
      {x:320, y:105, t:'b1'},
    ]
  },
];

let selChar = characters[0];
let selLevel = levels[0];
let loopId = null;
let p, plats, enemies, projectiles, particles;
let combo = 0, comboTimer = 0;
const GRAV = 0.55;

// ═══════════════════════════════════════════
//  MENUS
// ═══════════════════════════════════════════
function changeState(s) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  document.getElementById('hud').style.display = 'none';
  if (loopId) { cancelAnimationFrame(loopId); loopId = null; }
  const el = document.getElementById('screen-' + s);
  if (el) el.classList.add('active');
  if (s === 'charSelect')  renderCharMenu();
  if (s === 'levelSelect') renderLevelMenu();
}

function renderCharMenu() {
  document.getElementById('char-list').innerHTML = characters.map(c => {
    const dark = darken(c.color, 0.5);
    const isJedi = c.type === 'jedi';
    const bars = Object.entries(c.stats).map(([k,v]) =>
      `<div class="cbar-row">
        <div class="cbar-lbl">${k}</div>
        <div class="cbar-bg"><div class="cbar-fill" style="width:${v*20}%;background:${c.color}66"></div></div>
      </div>`
    ).join('');
    const saberEl = isJedi
      ? `<div class="fig-saber" style="background:${c.saber};color:${c.saber}"></div>`
      : `<div class="fig-gun"></div>`;
    return `
    <div class="char-card ${selChar.id===c.id?'sel':''}" onclick="selectChar(${c.id})">
      <div class="card-fig">
        <div class="fig-head" style="background:${c.color}"></div>
        <div class="fig-body" style="background:${dark}"></div>
        <div class="fig-lleg" style="background:${dark}"></div>
        <div class="fig-rleg" style="background:${dark}"></div>
        <div class="fig-larm" style="background:${c.color}"></div>
        <div class="fig-rarm" style="background:${c.color}"></div>
        ${saberEl}
      </div>
      <div class="card-name" style="color:${c.color}">${c.short}</div>
      <div class="card-role">${c.role}</div>
      <div class="card-bars">${bars}</div>
    </div>`;
  }).join('');
}

function selectChar(id) { selChar = characters.find(c=>c.id===id); renderCharMenu(); }

function renderLevelMenu() {
  document.getElementById('level-list').innerHTML = levels.map(l => `
    <div class="level-card ${selLevel.id===l.id?'sel':''}" onclick="selectLevel(${l.id})">
      <div class="level-name">${l.name}</div>
      <div class="level-info">${l.info}</div>
    </div>`).join('');
}

function selectLevel(id) { selLevel = levels.find(l=>l.id===id); renderLevelMenu(); }

function darken(hex, amt) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(x=>x+x).join('');
  const r = Math.max(0, Math.round(parseInt(hex.slice(0,2),16)*amt));
  const g = Math.max(0, Math.round(parseInt(hex.slice(2,4),16)*amt));
  const b = Math.max(0, Math.round(parseInt(hex.slice(4,6),16)*amt));
  return `rgb(${r},${g},${b})`;
}

// ═══════════════════════════════════════════
//  START GAME
// ═══════════════════════════════════════════
function startGame() {
  document.querySelectorAll('.screen').forEach(el=>el.classList.remove('active'));
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('hud-name').textContent = selChar.short;
  combo = 0; comboTimer = 0;

  p = {
    x:60, y:420, w:18, h:38, vx:0, vy:0,
    hp:selChar.hp, maxHp:selChar.hp,
    fp:selChar.fp, maxFp:selChar.fp,
    grounded:false, dir:1,
    attacking:0, attackCd:0,
    forceCd:0, forceVfx:0,
    shootCd:0,
    hurt:0, dead:false
  };

  plats = selLevel.plats;
  projectiles = [];
  particles   = [];

  const maxHpMap = {b1:35, b2:80, sniper:25};
  enemies = selLevel.enemies.map(e => ({
    x:e.x, y:e.y - 38, w:18, h:38, vx:0, vy:0,
    hp:maxHpMap[e.t]||35, maxHp:maxHpMap[e.t]||35,
    type:e.t, grounded:false, dir:-1,
    atkTimer:e.t==='sniper'?60:0,
    alertTimer:0, stunTimer:0,
    patrolDir:1, patrolTimer:80+Math.random()*60,
    dead:false, deathTimer:0
  }));

  updateHUD();
  if (loopId) cancelAnimationFrame(loopId);
  loopId = requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════
function gameLoop() {
  update();
  draw();
  if (p.dead) { changeState('gameover'); return; }
  if (enemies.filter(e=>!e.dead).length === 0) { setTimeout(()=>changeState('win'), 700); return; }
  loopId = requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════
function update() {
  const L = keys['ArrowLeft']  || keys['KeyA'];
  const R = keys['ArrowRight'] || keys['KeyD'];
  const U = keys['ArrowUp']    || keys['KeyW'];

  // Player movement
  if (L)      { p.vx = -selChar.spd; p.dir = -1; }
  else if (R) { p.vx =  selChar.spd; p.dir =  1; }
  else        { p.vx *= 0.78; }

  if (U && p.grounded) { p.vy = selChar.jump; p.grounded = false; }

  // Melee / Ranged attack
  const atkKey = keys['Space'] || keys['KeyJ'];
  if (atkKey && p.attackCd <= 0) {
    p.attacking = 18; p.attackCd = selChar.type==='clone' ? 20 : 24;

    if (selChar.type === 'jedi') {
      // Melee
      enemies.forEach(en => {
        if (en.dead) return;
        const dx = (en.x+en.w/2) - (p.x+p.w/2);
        const dy = (en.y+en.h/2) - (p.y+p.h/2);
        if (Math.abs(dx)<58 && Math.sign(dx)===p.dir && Math.abs(dy)<32) {
          en.hp -= selChar.dmg;
          en.vx = p.dir*7; en.vy = -3; en.stunTimer = 14;
          addCombo(); spawnHit(en.x+en.w/2, en.y+en.h/2, selChar.saber);
          if (en.hp <= 0) killEnemy(en);
        }
      });
    } else {
      // Clone shoots
      projectiles.push({
        x:p.x + (p.dir===1?p.w+2:-2), y:p.y+16,
        vx:p.dir*11, vy:0, friendly:true, life:100
      });
    }
  }
  if (p.attacking > 0) p.attacking--;
  if (p.attackCd > 0)  p.attackCd--;

  // Force push (F key)
  if (keys['KeyF'] && p.forceCd <= 0 && p.fp >= 22) {
    p.fp -= 22; p.forceCd = 65; p.forceVfx = 14;
    enemies.forEach(en => {
      if (en.dead) return;
      const dx = (en.x+en.w/2) - (p.x+p.w/2);
      if (Math.abs(dx)<150 && Math.sign(dx)===p.dir) {
        en.vx = p.dir*15; en.vy = -7; en.stunTimer = 35;
        spawnHit(en.x+en.w/2, en.y+en.h/2, '#48f');
        en.hp -= 12;
        if (en.hp <= 0) killEnemy(en);
      }
    });
    projectiles.forEach(pr => {
      if (pr.friendly) return;
      const dx = pr.x - (p.x+p.w/2);
      if (Math.abs(dx)<150 && Math.sign(dx)===p.dir) { pr.vx = -pr.vx*1.5; pr.friendly = true; }
    });
  }
  if (p.forceCd  > 0) p.forceCd--;
  if (p.forceVfx > 0) p.forceVfx--;
  if (p.hurt     > 0) p.hurt--;
  if (p.fp < selChar.fp) p.fp = Math.min(selChar.fp, p.fp+0.07);
  if (comboTimer > 0) comboTimer--; else combo = 0;

  // Player physics
  p.vy += GRAV;
  p.x  += p.vx; p.y += p.vy;
  resolve(p);
  p.x = Math.max(0, Math.min(782, p.x));
  if (p.y > 560) { p.dead = true; return; }

  // ── ENEMY AI ──────────────────────────────
  enemies.forEach(en => {
    if (en.dead) { en.deathTimer--; return; }

    en.vy += GRAV;

    // Stunned: just slide and fall, no AI
    if (en.stunTimer > 0) {
      en.stunTimer--;
      en.vx *= 0.88;
      en.x += en.vx; en.y += en.vy;
      resolve(en);
      if (en.y > 560) killEnemy(en);
      return;
    }

    const px = p.x + p.w/2, py = p.y + p.h/2;
    const ex = en.x + en.w/2, ey = en.y + en.h/2;
    const dx = px - ex;
    const absDx = Math.abs(dx);

    // Vision / alert
    if (absDx < 340) en.alertTimer = 100;
    else if (en.alertTimer > 0) en.alertTimer--;
    const alert = en.alertTimer > 0;

    if (en.type === 'sniper') {
      // ── SNIPER ───────────────────────────
      en.dir = Math.sign(dx) || 1;
      // Back away when too close
      if (absDx < 90 && en.grounded) en.vx += -en.dir * 0.4;
      en.vx *= 0.85;
      if (alert && en.atkTimer <= 0) {
        const aimY = (py - ey) / Math.max(1, absDx) * 7; // lead shot slightly
        projectiles.push({ x:ex, y:ey, vx:en.dir*7, vy:aimY, friendly:false, life:140 });
        en.atkTimer = 95;
      }
      if (en.atkTimer > 0) en.atkTimer--;

    } else {
      // ── MELEE (b1/b2) ────────────────────
      const spd = en.type==='b2' ? 1.9 : 2.7;

      if (alert && absDx > 24) {
        en.dir = Math.sign(dx);

        // EDGE DETECTION — look one step ahead
        const lookX = en.x + en.dir * (en.w + 6);
        const floorAhead = plats.some(pl =>
          lookX >= pl.x && lookX <= pl.x+pl.w &&
          en.y+en.h >= pl.y-6 && en.y+en.h <= pl.y+8
        );
        const wallAhead = plats.some(pl =>
          lookX+en.w > pl.x && lookX < pl.x+pl.w &&
          en.y+en.h > pl.y+8 && en.y < pl.y+pl.h
        );

        if (!floorAhead && en.grounded) {
          // Gap ahead — stop unless player is clearly above (jump to reach them)
          if (p.y < en.y - 60 && en.grounded) {
            // only jump if there's a platform roughly above
            const upPlat = plats.some(pl =>
              en.x+en.w/2 >= pl.x && en.x+en.w/2 <= pl.x+pl.w && pl.y < en.y - 10
            );
            if (upPlat) { en.vy = -12; en.grounded = false; en.vx = en.dir*spd; }
            else en.vx *= 0.5;
          } else {
            en.vx *= 0.4; // stop at edge, player is not above
          }
        } else if (wallAhead && en.grounded) {
          // Wall in the way — jump over it
          en.vy = -12; en.grounded = false;
          en.vx = en.dir * spd;
        } else {
          en.vx = en.dir * spd;
        }

      } else if (!alert) {
        // Patrol
        en.patrolTimer--;
        if (en.patrolTimer <= 0) {
          en.patrolDir *= -1;
          en.patrolTimer = 80 + Math.random()*80;
        }
        const lx = en.x + en.patrolDir*(en.w+4);
        const hasFloor = plats.some(pl =>
          lx >= pl.x && lx <= pl.x+pl.w &&
          en.y+en.h >= pl.y-6 && en.y+en.h <= pl.y+8
        );
        if (hasFloor && en.grounded) en.vx = en.patrolDir * 0.9;
        else { en.vx *= 0.5; en.patrolDir *= -1; en.patrolTimer = 60; }
      } else {
        en.vx *= 0.7;
      }

      // Melee hit player
      if (en.atkTimer <= 0 && absDx < 26 && Math.abs(py-ey) < 34 && p.hurt <= 0) {
        const dmg = en.type==='b2' ? 22 : 11;
        p.hp -= dmg; p.hurt = 28;
        p.vx = en.dir*9; p.vy = -3;
        en.atkTimer = 55;
        updateHUD();
      }
      if (en.atkTimer > 0) en.atkTimer--;
    }

    en.x += en.vx; en.y += en.vy;
    resolve(en);
    if (en.y > 560) killEnemy(en); // fell off map
  });

  // ── PROJECTILES ───────────────────────────
  projectiles = projectiles.filter(pr => {
    pr.x += pr.vx; pr.y += pr.vy; pr.life--;
    if (pr.life <= 0 || pr.x < -30 || pr.x > 830) return false;

    // Hit platform
    if (plats.some(pl => pr.x>pl.x && pr.x<pl.x+pl.w && pr.y>pl.y && pr.y<pl.y+pl.h)) {
      spawnHit(pr.x, pr.y, '#f84'); return false;
    }

    if (!pr.friendly) {
      // Jedi can deflect with active saber attack
      if (selChar.type==='jedi' && p.attacking>0) {
        const ddx = pr.x - (p.x+p.w/2);
        if (Math.abs(ddx)<44 && Math.abs(pr.y-(p.y+p.h/2))<30 && Math.sign(ddx)!==p.dir) {
          pr.vx *= -1.4; pr.friendly = true;
          spawnHit(pr.x, pr.y, selChar.saber); addCombo(); return true;
        }
      }
      // Hit player
      if (pr.x>p.x && pr.x<p.x+p.w && pr.y>p.y && pr.y<p.y+p.h && p.hurt<=0) {
        p.hp -= 14; p.hurt = 22; spawnHit(pr.x, pr.y, '#f44'); updateHUD(); return false;
      }
    } else {
      for (const en of enemies) {
        if (en.dead) continue;
        if (pr.x>en.x && pr.x<en.x+en.w && pr.y>en.y && pr.y<en.y+en.h) {
          en.hp -= 30; en.stunTimer = 8;
          spawnHit(pr.x, pr.y, '#ff0'); addCombo();
          if (en.hp<=0) killEnemy(en);
          return false;
        }
      }
    }
    return true;
  });

  // Particles
  particles = particles.filter(pt => {
    pt.life--; pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.18;
    return pt.life > 0;
  });

  updateHUD();
  if (p.hp <= 0) p.dead = true;
}

function addCombo() { combo++; comboTimer = 110; }

function killEnemy(en) {
  if (en.dead) return;
  en.dead = true; en.deathTimer = 28;
  spawnExplosion(en.x+en.w/2, en.y+en.h/2);
  addCombo();
}

function spawnHit(x, y, color) {
  for (let i=0;i<6;i++) {
    const a=Math.random()*Math.PI*2, s=Math.random()*3+1;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color,life:16,maxLife:16});
  }
}
function spawnExplosion(x, y) {
  for (let i=0;i<14;i++) {
    const a=(i/14)*Math.PI*2, s=Math.random()*4+2;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color:'#f80',life:26,maxLife:26});
  }
  for (let i=0;i<8;i++) {
    const a=Math.random()*Math.PI*2, s=Math.random()*2+1;
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,color:'#ff4',life:18,maxLife:18});
  }
}

// ── Collision ─────────────────────────────────
function resolve(e) {
  e.grounded = false;
  for (const pl of plats) {
    const ox = e.x < pl.x+pl.w && e.x+e.w > pl.x;
    if (!ox) continue;
    const foot = e.y + e.h;
    if (e.vy >= 0 && foot > pl.y && foot < pl.y+pl.h+10 && e.y < pl.y+4) {
      e.y = pl.y - e.h; e.vy = 0; e.grounded = true;
    }
    if (e.vy < 0 && e.y < pl.y+pl.h && e.y+e.h > pl.y+pl.h) {
      e.y = pl.y+pl.h; e.vy = 0;
    }
  }
}

function updateHUD() {
  document.getElementById('fill-hp').style.width = Math.max(0,p.hp/p.maxHp*100)+'%';
  document.getElementById('fill-fp').style.width = Math.max(0,p.fp/selChar.fp*100)+'%';
  const cel = document.getElementById('hud-combo');
  cel.textContent  = combo > 1 ? combo+'x' : '';
  cel.style.opacity = combo > 1 ? '1' : '0';
}

// ═══════════════════════════════════════════
//  DRAW
// ═══════════════════════════════════════════
function draw() {
  const W=800, H=500;

  // BG
  ctx.fillStyle = selLevel.bg;
  ctx.fillRect(0,0,W,H);

  // subtle grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.025)';
  ctx.lineWidth = 1;
  for (let x=0;x<W;x+=80)  { ctx.beginPath(); ctx.moveTo(x,0);   ctx.lineTo(x,H);   ctx.stroke(); }
  for (let y=0;y<H;y+=60)  { ctx.beginPath(); ctx.moveTo(0,y);   ctx.lineTo(W,y);   ctx.stroke(); }

  // Platforms
  plats.forEach(pl => {
    // body
    ctx.fillStyle = selLevel.fc;
    ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
    // top edge highlight
    ctx.fillStyle = selLevel.ec;
    ctx.fillRect(pl.x, pl.y, pl.w, 3);
    // subtle sheen
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(pl.x, pl.y+3, pl.w, 3);
  });

  // Particles
  particles.forEach(pt => {
    const a = pt.life/pt.maxLife;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = pt.color;
    const sz = a*5+1;
    ctx.fillRect(pt.x-sz/2, pt.y-sz/2, sz, sz);
    ctx.restore();
  });

  // ── Enemies ───────────────────────────────
  enemies.forEach(en => {
    if (en.dead && en.deathTimer<=0) return;
    const alpha = en.dead ? en.deathTimer/28 : 1;
    ctx.save(); ctx.globalAlpha = alpha;

    const ex = Math.round(en.x), ey = Math.round(en.y);
    const col  = en.type==='b2' ? '#556' : en.type==='sniper' ? '#944' : '#bca';
    const dark = en.type==='b2' ? '#334' : en.type==='sniper' ? '#622' : '#887';
    const eye  = en.type==='sniper' ? '#f44' : '#ff0';

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.fillRect(ex+2, ey+en.h, en.w-4, 3);

    // Legs
    ctx.fillStyle = dark;
    ctx.fillRect(ex+2,  ey+27, 7, 11);
    ctx.fillRect(ex+9,  ey+27, 7, 11);

    // Body
    ctx.fillStyle = col;
    ctx.fillRect(ex, ey+11, en.w, 17);

    // Arms
    ctx.fillStyle = col;
    ctx.fillRect(ex-4, ey+12, 5, 11);
    ctx.fillRect(ex+en.w-1, ey+12, 5, 11);

    // Head
    ctx.fillStyle = dark;
    ctx.fillRect(ex+2, ey, en.w-4, 12);

    // Eyes
    ctx.fillStyle = eye;
    ctx.shadowColor = eye; ctx.shadowBlur = 5;
    ctx.fillRect(ex+4, ey+3, 3, 3);
    ctx.fillRect(ex+11,ey+3, 3, 3);
    ctx.shadowBlur = 0;

    // Gun
    ctx.fillStyle = '#444';
    const gx = en.dir===1 ? ex+en.w : ex-8;
    ctx.fillRect(gx, ey+14, 10, 4);

    // HP bar
    if (!en.dead) {
      const hpPct = en.hp/en.maxHp;
      ctx.fillStyle='#200'; ctx.fillRect(ex, ey-8, en.w, 4);
      ctx.fillStyle = hpPct>0.5?'#0c0':hpPct>0.25?'#fa0':'#f30';
      ctx.fillRect(ex, ey-8, en.w*hpPct, 4);
    }
    ctx.restore();
  });

  // ── Player ────────────────────────────────
  const flicker = p.hurt>0 && Math.floor(Date.now()/70)%2===0;
  if (!p.dead && !flicker) {
    ctx.save();
    const px = Math.round(p.x), py = Math.round(p.y);
    const col = selChar.color;
    const dark = darken(col, 0.55);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(px+2, py+p.h, p.w-4, 4);

    // Animated legs
    const run = p.grounded && Math.abs(p.vx) > 0.5;
    const lOff = run ? Math.sin(Date.now()/70)*7 : 0;
    ctx.fillStyle = dark;
    ctx.fillRect(px+2,  py+27, 7, 11 + lOff);
    ctx.fillRect(px+9,  py+27, 7, 11 - lOff);

    // Body
    ctx.fillStyle = dark;
    ctx.fillRect(px, py+11, p.w, 17);

    // Belt strip
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(px, py+24, p.w, 2);

    // Arms
    ctx.fillStyle = col;
    ctx.fillRect(px-4, py+11, 5, 11);
    ctx.fillRect(px+p.w-1, py+11, 5, 11);

    // Head
    ctx.fillStyle = col;
    ctx.fillRect(px+3, py, p.w-6, 12);

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.shadowColor='#fff'; ctx.shadowBlur=3;
    const eyeX = p.dir===1 ? px+10 : px+3;
    ctx.fillRect(eyeX, py+3, 3, 3);
    ctx.shadowBlur = 0;

    // Weapon
    if (selChar.type === 'jedi') {
      const bx = p.dir===1 ? px+p.w+2 : px-4;
      const swing = p.attacking > 0;
      ctx.save();
      ctx.translate(bx, py+16);
      ctx.rotate(swing ? (p.dir===1?0.3:-0.3) : (p.dir===1?-0.5:0.5));
      // Hilt
      ctx.fillStyle = '#888';
      ctx.fillRect(-2,-2,4,6);
      // Blade
      const sc = selChar.saber;
      ctx.fillStyle = sc;
      ctx.shadowColor = sc; ctx.shadowBlur = 12;
      ctx.fillRect(-1.5,-26,3,26);
      ctx.shadowBlur = 0;
      ctx.restore();
    } else {
      // Blaster
      ctx.fillStyle = '#555';
      const gx2 = p.dir===1 ? px+p.w : px-14;
      ctx.fillRect(gx2, py+16, 16, 5);
      ctx.fillStyle = '#777';
      ctx.fillRect(p.dir===1 ? gx2+14 : gx2-2, py+17, 3, 3);
    }

    // Force aura
    if (p.forceVfx > 0) {
      ctx.save();
      ctx.strokeStyle = '#48f';
      ctx.lineWidth = 2;
      ctx.globalAlpha = (p.forceVfx/14)*0.6;
      ctx.shadowColor = '#48f'; ctx.shadowBlur = 18;
      ctx.strokeRect(px-10, py-6, p.w+20, p.h+10);
      ctx.restore();
    }

    ctx.restore();
  }

  // Projectiles
  projectiles.forEach(pr => {
    ctx.save();
    ctx.fillStyle = pr.friendly ? selChar.color : '#f55';
    ctx.shadowColor = pr.friendly ? selChar.color : '#f55';
    ctx.shadowBlur = 8;
    ctx.fillRect(pr.x-5, pr.y-2, 10, 4);
    ctx.restore();
  });
}

// Init
changeState('title');
