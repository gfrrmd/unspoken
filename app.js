const chatArea = document.getElementById('chatArea');
const endingScreen = document.createElement('div');
endingScreen.className = 'ending-screen';
document.getElementById('app').appendChild(endingScreen);

const endingLines = [
  { text: 'He came to me first.', cls: '' },
  { text: 'He asked to know me.', cls: '' },
  { text: 'He kissed me like I was worth staying for.', cls: '' },
  { text: 'Then he left —', cls: '' },
  { text: 'without a goodbye,', cls: '' },
  { text: 'without an explanation,', cls: '' },
  { text: 'without even a proper ending.', cls: '' },
  { text: 'And somehow, I\'m still here.', cls: 'white' },
  { text: 'Still wondering if I was the problem.', cls: 'white' },
  { text: 'I wasn\'t.', cls: 'white' },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function addTimestamp(text) {
  const el = document.createElement('div');
  el.className = 'timestamp';
  el.textContent = text;
  chatArea.appendChild(el);
  scrollToBottom();
}

async function addBubble(type, text) {
  // Show typing indicator for 'him'
  if (type === 'him') {
    const typingWrapper = document.createElement('div');
    typingWrapper.className = 'typing-wrapper';
    typingWrapper.innerHTML = `<div class="typing-bubble"><span></span><span></span><span></span></div>`;
    chatArea.appendChild(typingWrapper);
    scrollToBottom();
    await sleep(50);
    typingWrapper.classList.add('visible');
    const typingDelay = Math.min(800 + text.length * 30, 2200);
    await sleep(typingDelay);
    typingWrapper.remove();
  }

  const wrapper = document.createElement('div');
  wrapper.className = `bubble-wrapper ${type === 'me' || type === 'me-unsent' ? 'me' : 'him'}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;
  if (type === 'me-unsent') bubble.style.opacity = '0.4';

  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  scrollToBottom();
  await sleep(50);
  wrapper.classList.add('visible');
  await sleep(type === 'him' ? 400 : 300);
}

async function addSeen(text, noReply = false) {
  const el = document.createElement('div');
  el.className = `read-receipt ${noReply ? 'seen-no-reply' : ''}`;
  el.textContent = text;
  chatArea.appendChild(el);
  scrollToBottom();
  await sleep(1200);
}

async function addTypingThenGone() {
  const typingWrapper = document.createElement('div');
  typingWrapper.className = 'typing-wrapper';
  typingWrapper.innerHTML = `<div class="typing-bubble"><span></span><span></span><span></span></div>`;
  chatArea.appendChild(typingWrapper);
  scrollToBottom();
  await sleep(80);
  typingWrapper.classList.add('visible');
  await sleep(2500);
  typingWrapper.classList.remove('visible');
  await sleep(400);
  typingWrapper.remove();
  await sleep(1000);
}

async function addSystem(text) {
  const el = document.createElement('div');
  el.className = 'system-notice';
  el.innerHTML = text.replace('\n', '<br>');
  chatArea.appendChild(el);
  scrollToBottom();
  await sleep(100);
  el.classList.add('visible');
  await sleep(2000);
}

async function addNotDelivered(text) {
  const el = document.createElement('div');
  el.className = 'read-receipt seen-no-reply';
  el.style.textAlign = 'right';
  el.style.paddingRight = '8px';
  el.textContent = text;
  chatArea.appendChild(el);
  scrollToBottom();
  await sleep(2000);
}

async function showEnding() {
  endingScreen.classList.add('visible');
  for (const line of endingLines) {
    const el = document.createElement('div');
    el.className = `ending-line ${line.cls}`;
    el.textContent = line.text;
    endingScreen.appendChild(el);
    await sleep(100);
    el.classList.add('visible');
    await sleep(1400);
  }
}

async function runStory() {
  await sleep(800);
  for (const msg of messages) {
    switch (msg.type) {
      case 'timestamp':
        addTimestamp(msg.text);
        await sleep(600);
        break;
      case 'him':
        await addBubble('him', msg.text);
        await sleep(600);
        break;
      case 'me':
        await addBubble('me', msg.text);
        await sleep(500);
        break;
      case 'me-unsent':
        await addBubble('me-unsent', msg.text);
        await sleep(500);
        break;
      case 'seen':
        await addSeen(msg.text, true);
        break;
      case 'typing-then-gone':
        await addTypingThenGone();
        break;
      case 'system':
        await addSystem(msg.text);
        break;
      case 'not-delivered':
        await addNotDelivered(msg.text);
        break;
      case 'ending':
        await sleep(1500);
        await showEnding();
        break;
    }
  }
}

runStory();
