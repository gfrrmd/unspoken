const chat = document.getElementById('chat');
const ending = document.getElementById('ending');
const endingInner = document.getElementById('endingInner');

// Dim overlay element
const dimOverlay = document.createElement('div');
dimOverlay.className = 'dim-overlay';
document.body.appendChild(dimOverlay);

const ENDING_LINES = [
  { text: 'He came to me first.',                      cls: 'accent' },
  { text: 'He asked to know me.',                      cls: 'accent' },
  { text: 'He kissed me like I was worth staying for.', cls: '' },
  { text: 'Then he left.',                              cls: '' },
  { text: 'No goodbye.',                               cls: '' },
  { text: 'No explanation.',                           cls: '' },
  { text: 'No proper ending.',                         cls: '' },
  { text: "And somehow — I'm still here.",             cls: 'bright' },
  { text: "I wasn't the problem.",                     cls: 'bright' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function scrollEnd() {
  chat.scrollTop = chat.scrollHeight;
}

// ── DIM TRANSITION (layar meredup ganti hari) ──
async function dimTransition(label) {
  // Fade to dark
  dimOverlay.classList.remove('dim-out');
  dimOverlay.classList.add('dim-in');
  await sleep(750);

  // Show timestamp while dark
  const wrap = document.createElement('div');
  wrap.className = 'ts-wrap';
  const ts = document.createElement('div');
  ts.className = 'ts';
  ts.textContent = label;
  wrap.appendChild(ts);
  chat.appendChild(wrap);
  scrollEnd();
  await sleep(60);
  ts.classList.add('show');
  await sleep(900);

  // Fade back in
  dimOverlay.classList.remove('dim-in');
  dimOverlay.classList.add('dim-out');
  await sleep(750);
  dimOverlay.classList.remove('dim-out');
}

// ── TYPING INDICATOR ──
async function showTyping(duration) {
  const row = document.createElement('div');
  row.className = 'typing-row';
  const av = document.createElement('div');
  av.className = 'row-avatar';
  av.textContent = 'M';
  const bub = document.createElement('div');
  bub.className = 'typing-bubble';
  bub.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  row.appendChild(av);
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

// ── ADD BUBBLE ──
let lastSide = null;

async function addBubble(side, text, unsent = false) {
  if (side === 'him') await showTyping(Math.min(900 + text.length * 26, 2200));

  const row = document.createElement('div');
  row.className = `row ${side}`;

  // Gap when side switches
  if (lastSide && lastSide !== side) row.classList.add('gap-top');
  lastSide = side;

  if (side === 'him') {
    const av = document.createElement('div');
    av.className = 'row-avatar';
    av.textContent = 'M';
    row.appendChild(av);
  }

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

// ── SEEN ──
async function addSeen() {
  const el = document.createElement('div');
  el.className = 'receipt';
  el.textContent = 'Seen';
  chat.appendChild(el);
  scrollEnd();
  await sleep(40);
  el.classList.add('show');
  await sleep(1400);
}

// ── SYSTEM ──
async function addSystem(text) {
  lastSide = null;
  const el = document.createElement('div');
  el.className = 'system';
  el.innerHTML = text.replace('\n', '<br>');
  chat.appendChild(el);
  scrollEnd();
  await sleep(40);
  el.classList.add('show');
  await sleep(2200);
}

// ── NOT DELIVERED ──
async function addNotDelivered() {
  const el = document.createElement('div');
  el.className = 'not-delivered';
  el.textContent = 'Not delivered';
  chat.appendChild(el);
  scrollEnd();
  await sleep(40);
  el.classList.add('show');
  await sleep(2000);
}

// ── TYPING THEN GONE ──
async function typingGone() {
  const row = document.createElement('div');
  row.className = 'typing-row';
  const av = document.createElement('div');
  av.className = 'row-avatar';
  av.textContent = 'M';
  const bub = document.createElement('div');
  bub.className = 'typing-bubble';
  bub.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  row.appendChild(av);
  row.appendChild(bub);
  chat.appendChild(row);
  scrollEnd();
  await sleep(40);
  row.classList.add('show');
  await sleep(3000);
  row.classList.remove('show');
  await sleep(300);
  row.remove();
  await sleep(900);
}

// ── ENDING ──
async function showEnding() {
  await sleep(1800);
  ending.classList.add('show');
  await sleep(600);
  for (const line of ENDING_LINES) {
    const el = document.createElement('div');
    el.className = `ending-line ${line.cls}`;
    el.textContent = line.text;
    endingInner.appendChild(el);
    await sleep(80);
    el.classList.add('show');
    await sleep(1600);
  }
}

// ── MAIN ──
async function run() {
  lastSide = null;
  await sleep(700);
  for (const msg of MESSAGES) {
    switch (msg.t) {
      case 'ts':
        lastSide = null;
        await dimTransition(msg.text);
        await sleep(300);
        break;
      case 'him':
        await addBubble('him', msg.text);
        await sleep(480);
        break;
      case 'me':
        await addBubble('me', msg.text);
        await sleep(380);
        break;
      case 'me-unsent':
        await addBubble('me', msg.text, true);
        await sleep(380);
        break;
      case 'seen':
        await addSeen();
        break;
      case 'typing-gone':
        await typingGone();
        break;
      case 'system':
        await addSystem(msg.text);
        break;
      case 'not-delivered':
        await addNotDelivered();
        break;
      case 'ending':
        await showEnding();
        break;
    }
  }
}

run();
