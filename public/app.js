const chat = document.getElementById('chat');
const ending = document.getElementById('ending');
const endingInner = document.getElementById('endingInner');

const dayScreen = document.createElement('div');
dayScreen.id = 'dayScreen';
dayScreen.innerHTML = '<div id="dayLabel"></div>';
document.getElementById('app').appendChild(dayScreen);

const ENDING_LINES = [
  { text: 'He came to me first.',                       cls: 'accent' },
  { text: 'He asked to know me.',                       cls: 'accent' },
  { text: 'He kissed me like I was worth staying for.', cls: '' },
  { text: 'Then he left.',                              cls: '' },
  { text: 'No goodbye.',                               cls: '' },
  { text: 'No explanation.',                           cls: '' },
  { text: 'No proper ending.',                         cls: '' },
  { text: "And somehow \u2014 I'm still here.",         cls: 'bright' },
  { text: "I wasn't the problem.",                     cls: 'bright' },
];

/*
  Avatar SVG: viewBox 0 0 100 130 (lebih tinggi dari lingkaran)
  - Lingkaran avatar = 100x100 di layar, tapi SVG punya viewBox 100x130
  - Kepala: cx=50 cy=44 r=26 → besar, benar-benar di tengah area atas
  - Badan: cx=50 cy=118 rx=40 ry=34 → hanya ujung atasnya yang kelihatan
    di bagian bawah lingkaran (karena overflow:hidden memotong)
*/
const AVATAR_SVG = `<svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
  <circle cx="50" cy="44" r="26" fill="#fff" opacity="0.92"/>
  <ellipse cx="50" cy="118" rx="40" ry="34" fill="#fff" opacity="0.92"/>
</svg>`;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function scrollEnd() {
  chat.scrollTop = chat.scrollHeight;
}

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
  const el = document.createElement('div');
  el.className = 'receipt';
  el.textContent = 'Seen';
  chat.appendChild(el);
  scrollEnd();
  await sleep(40);
  el.classList.add('show');
  await sleep(1400);
}

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

async function typingGone() {
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
  await sleep(3000);
  row.classList.remove('show');
  await sleep(300);
  row.remove();
  await sleep(900);
}

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
