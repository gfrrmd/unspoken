const chat = document.getElementById('chat');
const ending = document.getElementById('ending');
const endingInner = document.getElementById('endingInner');

const dayScreen = document.createElement('div');
dayScreen.id = 'dayScreen';
dayScreen.innerHTML = '<div id="dayLabel"></div>';
document.getElementById('app').appendChild(dayScreen);

// Background audio — starts on first user interaction
const bgAudio = new Audio('backsound.mp3');
bgAudio.volume = 0.18;
bgAudio.loop = false;
let audioStarted = false;
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  bgAudio.play().catch(() => {});
  document.removeEventListener('touchstart', startAudio);
  document.removeEventListener('click', startAudio);
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
  el.className = 'ts';
  el.textContent = label;
  chat.appendChild(el);
  scrollEnd();
}

async function dayTransition(label) {
  const dayLabel = document.getElementById('dayLabel');
  dayLabel.textContent = label;
  dayLabel.style.opacity = '0';
  dayScreen.classList.add('visible');
  await sleep(1000);
  dayLabel.style.transition = 'opacity 0.9s ease';
  dayLabel.style.opacity = '1';
  await sleep(2200);
  dayLabel.style.opacity = '0';
  await sleep(900);
  dayScreen.classList.remove('visible');
  await sleep(1000);
  addTsInChat(label);
  await sleep(400);
}

async function showTyping(duration) {
  const row = document.createElement('div');
  row.className = 'typing-row';
  row.appendChild(makeAvatar());
  const bub = document.createElement('div');
  bub.className = 'typing-bubble';
  bub.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  row.appendChild(bub);
  chat.appendChild(row);
  scrollEnd();
  await sleep(40);
  row.classList.add('show');
  await sleep(duration);
  row.classList.remove('show');
  await sleep(260);
  row.remove();
}

let lastSide = null;
async function addBubble(side, text, unsent = false) {
  if (side === 'him') await showTyping(Math.min(900 + text.length * 26, 2200));
  const row = document.createElement('div');
  row.className = `row ${side}`;
  if (lastSide && lastSide !== side) row.classList.add('gap-top');
  lastSide = side;
  if (side === 'him') row.appendChild(makeAvatar());
  const bub = document.createElement('div');
  bub.className = 'bubble';
  bub.textContent = text;
  if (unsent) bub.style.opacity = '0.38';
  row.appendChild(bub);
  chat.appendChild(row);
  scrollEnd();
  await sleep(30);
  row.classList.add('show');
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

// ── DIALOG ──
function showDialog(title, msg, buttons) {
  return new Promise(resolve => {
    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';
    const dialog = document.createElement('div');
    dialog.className = 'dialog';
    dialog.innerHTML = `
      <div class="dialog-body">
        <div class="dialog-title">${title}</div>
        <div class="dialog-msg">${msg}</div>
      </div>
      <div class="dialog-actions">
        ${buttons.map((b, i) => `<button class="dialog-btn ${b.cls || ''}" data-i="${i}">${b.label}</button>`).join('')}
      </div>`;
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
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

// ── MUSIC NOTIF ──
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
      // Slide notif away
      notif.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
      notif.style.opacity = '0';
      notif.style.transform = 'translateX(-50%) translateY(-120%)';
      setTimeout(() => { notif.remove(); resolve(); }, 420);
    });
  });
}

// ── OPEN PLAYER PAGE (slide up animation) ──
function openPlayer() {
  // Stop bg audio
  bgAudio.pause();

  const sheet = document.createElement('div');
  sheet.style.cssText = `
    position: fixed; inset: 0; z-index: 400;
    transform: translateY(100%);
    transition: transform 0.5s cubic-bezier(0.32,0.72,0,1);
  `;
  const iframe = document.createElement('iframe');
  iframe.src = 'player.html';
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
  sheet.appendChild(iframe);
  document.body.appendChild(sheet);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sheet.style.transform = 'translateY(0)';
  }));
}

// ── POST ENDING ──
async function postEnding() {
  await sleep(1400);
  await deleteFeelingSequence();
  await sleep(700);
  await showMusicNotif();
  await sleep(300);
  openPlayer();
}

async function run() {
  lastSide = null;
  await sleep(700);
  for (const msg of MESSAGES) {
    switch (msg.t) {
      case 'ts':
        lastSide = null;
        await sleep(1800);
        await dayTransition(msg.text);
        await sleep(300);
        break;
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
