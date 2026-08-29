const chat = document.getElementById('chat');
const ending = document.getElementById('ending');
const endingInner = document.getElementById('endingInner');

const dayScreen = document.createElement('div');
dayScreen.id = 'dayScreen';
dayScreen.innerHTML = '<div id="dayLabel"></div>';
document.getElementById('app').appendChild(dayScreen);

// Background audio
const bgAudio = new Audio('backsound.mp3');
bgAudio.volume = 0.18;
let audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  bgAudio.play().catch(() => {});
}
document.addEventListener('touchstart', startAudio, { once: true });
document.addEventListener('click', startAudio, { once: true });

const AVATAR_SVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="24" fill="#fff" opacity="0.92"/>
  <ellipse cx="50" cy="108" rx="44" ry="40" fill="#fff" opacity="0.92"/>
</svg>`;

const sleep = ms => new Promise(r => setTimeout(r, ms));
function scrollEnd() { chat.scrollTop = chat.scrollHeight; }
function makeAvatar() {
  const el = document.createElement('div');
  el.className = 'row-avatar';
  el.innerHTML = AVATAR_SVG;
  return el;
}
function addTsInChat(label) {
  const el = document.createElement('div');
  el.className = 'ts'; el.textContent = label;
  chat.appendChild(el); scrollEnd();
}
async function dayTransition(label) {
  const dayLabel = document.getElementById('dayLabel');
  dayLabel.textContent = label; dayLabel.style.opacity = '0';
  dayScreen.classList.add('visible');
  await sleep(1000);
  dayLabel.style.transition = 'opacity 0.9s ease'; dayLabel.style.opacity = '1';
  await sleep(2200);
  dayLabel.style.opacity = '0'; await sleep(900);
  dayScreen.classList.remove('visible'); await sleep(1000);
  addTsInChat(label); await sleep(400);
}
async function showTyping(duration) {
  const row = document.createElement('div'); row.className = 'typing-row';
  row.appendChild(makeAvatar());
  const bub = document.createElement('div'); bub.className = 'typing-bubble';
  bub.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  row.appendChild(bub); chat.appendChild(row); scrollEnd();
  await sleep(40); row.classList.add('show');
  await sleep(duration);
  row.classList.remove('show'); await sleep(260); row.remove();
}
let lastSide = null;
async function addBubble(side, text, unsent = false) {
  if (side === 'him') await showTyping(Math.min(900 + text.length * 26, 2200));
  const row = document.createElement('div');
  row.className = `row ${side}`;
  if (lastSide && lastSide !== side) row.classList.add('gap-top');
  lastSide = side;
  if (side === 'him') row.appendChild(makeAvatar());
  const bub = document.createElement('div'); bub.className = 'bubble';
  bub.textContent = text;
  if (unsent) bub.style.opacity = '0.38';
  row.appendChild(bub); chat.appendChild(row); scrollEnd();
  await sleep(30); row.classList.add('show');
  await sleep(side === 'him' ? 360 : 240);
}
async function addSeen() {
  const el = document.createElement('div'); el.className = 'receipt'; el.textContent = 'Seen';
  chat.appendChild(el); scrollEnd();
  await sleep(40); el.classList.add('show'); await sleep(1400);
}
async function addSystem(text) {
  lastSide = null;
  const el = document.createElement('div'); el.className = 'system';
  el.innerHTML = text.replace('\n', '<br>');
  chat.appendChild(el); scrollEnd();
  await sleep(40); el.classList.add('show'); await sleep(2200);
}
async function addNotDelivered() {
  const el = document.createElement('div'); el.className = 'not-delivered'; el.textContent = 'Not delivered';
  chat.appendChild(el); scrollEnd();
  await sleep(40); el.classList.add('show'); await sleep(2000);
}
async function typingGone() {
  const row = document.createElement('div'); row.className = 'typing-row';
  row.appendChild(makeAvatar());
  const bub = document.createElement('div'); bub.className = 'typing-bubble';
  bub.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  row.appendChild(bub); chat.appendChild(row); scrollEnd();
  await sleep(40); row.classList.add('show'); await sleep(3000);
  row.classList.remove('show'); await sleep(300); row.remove(); await sleep(900);
}

// DIALOG
function showDialog(title, msg, buttons) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';
    const dialog = document.createElement('div'); dialog.className = 'dialog';
    dialog.innerHTML = `
      <div class="dialog-body">
        <div class="dialog-title">${title}</div>
        <div class="dialog-msg">${msg}</div>
      </div>
      <div class="dialog-actions">
        ${buttons.map((b,i) => `<button class="dialog-btn ${b.cls||''}" data-i="${i}">${b.label}</button>`).join('')}
      </div>`;
    backdrop.appendChild(dialog); document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add('show'));
    backdrop.querySelectorAll('.dialog-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        backdrop.classList.remove('show');
        setTimeout(() => { backdrop.remove(); resolve(+btn.dataset.i); }, 260);
      });
    });
  });
}
async function deleteFeelingSequence() {
  let chose_delete = true;
  while (chose_delete) {
    const choice = await showDialog(
      'Delete Feelings',
      'Are you sure you want to delete everything you felt?',
      [{ label: 'Keep', cls: 'bold' }, { label: 'Delete', cls: 'destructive' }]
    );
    if (choice === 0) {
      chose_delete = false;
    } else {
      await showDialog(
        'Cannot Delete',
        'These feelings cannot be deleted. They happened. They were real.',
        [{ label: 'OK', cls: 'bold' }]
      );
    }
  }
}

// MUSIC NOTIF
function showMusicNotif() {
  return new Promise(resolve => {
    const notif = document.createElement('div');
    notif.className = 'music-notif';
    notif.innerHTML = `
      <div class="music-notif-icon">
        <svg viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
      </div>
      <div class="music-notif-content">
        <div class="music-notif-app">Apple Music</div>
        <div class="music-notif-title">How are you feeling?</div>
        <div class="music-notif-sub">We found music for this moment. Play it.</div>
      </div>
      <button class="music-notif-open">Open</button>`;
    document.body.appendChild(notif);
    requestAnimationFrame(() => requestAnimationFrame(() => notif.classList.add('show')));
    notif.querySelector('.music-notif-open').addEventListener('click', () => {
      notif.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(-50%) translateY(-120%)';
      setTimeout(() => { notif.remove(); resolve(); }, 360);
    });
  });
}

// INLINE MUSIC PLAYER
function openPlayer() {
  const TOTAL = 4 * 60 + 52;
  const START = 2 * 60 + 46;
  let current = START;
  let isPlaying = true;
  let timer = null;

  function fmt(s) {
    s = Math.max(0, Math.min(TOTAL, Math.round(s)));
    return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  }

  const sheet = document.createElement('div');
  sheet.className = 'music-player-sheet';

  // SVG icons — matching Apple Music exactly
  const ICO_PREV   = `<svg width="44" height="44" viewBox="0 0 44 44" fill="white"><polygon points="22,8 6,22 22,36"/><rect x="26" y="8" width="6" height="28" rx="2"/></svg>`;
  const ICO_PAUSE  = `<svg width="52" height="52" viewBox="0 0 52 52" fill="white"><rect x="12" y="10" width="10" height="32" rx="3"/><rect x="30" y="10" width="10" height="32" rx="3"/></svg>`;
  const ICO_PLAY   = `<svg width="52" height="52" viewBox="0 0 52 52" fill="white"><polygon points="14,8 42,26 14,44"/></svg>`;
  const ICO_NEXT   = `<svg width="44" height="44" viewBox="0 0 44 44" fill="white"><polygon points="22,8 38,22 22,36"/><rect x="12" y="8" width="6" height="28" rx="2"/></svg>`;
  const ICO_STAR   = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  const ICO_MORE   = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#c0c0c0"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`;
  const ICO_VOL_LO = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#8e8e93"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>`;
  const ICO_VOL_HI = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#8e8e93"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#8e8e93" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#8e8e93" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const ICO_LYRICS = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  const ICO_AIR    = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.8"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/><polygon points="12 15 17 21 7 21 12 15"/></svg>`;
  const ICO_QUEUE  = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6" stroke-width="2.5"/><line x1="3" y1="12" x2="3.01" y2="12" stroke-width="2.5"/><line x1="3" y1="18" x2="3.01" y2="18" stroke-width="2.5"/></svg>`;

  sheet.innerHTML = `
    <div class="mp-inner">
      <div class="mp-handle"></div>
      <div class="mp-cover-wrap">
        <img class="mp-cover" src="coveralbum.jpg" alt="" />
      </div>
      <div class="mp-info">
        <div class="mp-info-text">
          <div class="mp-title">i love you</div>
          <div class="mp-artist">Billie Eilish</div>
        </div>
        <div class="mp-info-btns">
          <button class="mp-icon-btn">${ICO_STAR}</button>
          <button class="mp-icon-btn">${ICO_MORE}</button>
        </div>
      </div>
      <div class="mp-progress-wrap">
        <div class="mp-bar-bg"><div class="mp-bar-fill" id="mpFill"></div></div>
        <div class="mp-times">
          <span id="mpCurrent">2:46</span>
          <span id="mpRemain">-2:06</span>
        </div>
      </div>
      <div class="mp-controls">
        <button class="mp-ctrl" id="mpPrev">${ICO_PREV}</button>
        <button class="mp-ctrl" id="mpPlay">${ICO_PAUSE}</button>
        <button class="mp-ctrl" id="mpNext">${ICO_NEXT}</button>
      </div>
      <div class="mp-volume">
        ${ICO_VOL_LO}
        <div class="mp-vol-bg"><div class="mp-vol-fill"></div></div>
        ${ICO_VOL_HI}
      </div>
      <div class="mp-bottom">
        <button class="mp-bottom-btn">${ICO_LYRICS}</button>
        <button class="mp-bottom-btn">${ICO_AIR}</button>
        <button class="mp-bottom-btn">${ICO_QUEUE}</button>
      </div>
    </div>`;

  document.body.appendChild(sheet);
  requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open')));

  const fillEl   = sheet.querySelector('#mpFill');
  const curEl    = sheet.querySelector('#mpCurrent');
  const remEl    = sheet.querySelector('#mpRemain');
  const playBtn  = sheet.querySelector('#mpPlay');

  function updateBar() {
    fillEl.style.width = (current / TOTAL * 100) + '%';
    curEl.textContent = fmt(current);
    remEl.textContent = '-' + fmt(TOTAL - current);
  }
  function tick() {
    if (!isPlaying) return;
    current = Math.min(current + 1, TOTAL);
    if (current >= TOTAL) { isPlaying = false; clearInterval(timer); playBtn.innerHTML = ICO_PLAY; }
    updateBar();
  }

  updateBar();
  // disable transition for first render
  fillEl.style.transition = 'none';
  requestAnimationFrame(() => { fillEl.style.transition = 'width 1s linear'; });
  timer = setInterval(tick, 1000);

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      timer = setInterval(tick, 1000);
      playBtn.innerHTML = ICO_PAUSE;
    } else {
      clearInterval(timer);
      playBtn.innerHTML = ICO_PLAY;
    }
  });
}

// POST ENDING
async function postEnding() {
  await sleep(1400);
  await deleteFeelingSequence();
  await sleep(700);
  await showMusicNotif();
  openPlayer();
}

async function run() {
  lastSide = null;
  await sleep(700);
  for (const msg of MESSAGES) {
    switch (msg.t) {
      case 'ts': lastSide = null; await sleep(1800); await dayTransition(msg.text); await sleep(300); break;
      case 'him':         await addBubble('him', msg.text); await sleep(480); break;
      case 'me':          await addBubble('me', msg.text);  await sleep(380); break;
      case 'me-unsent':   await addBubble('me', msg.text, true); await sleep(380); break;
      case 'seen':        await addSeen(); break;
      case 'typing-gone': await typingGone(); break;
      case 'system':      await addSystem(msg.text); break;
      case 'not-delivered': await addNotDelivered(); break;
      case 'post-ending': await postEnding(); break;
    }
  }
}
run();
