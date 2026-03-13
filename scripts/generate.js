#!/usr/bin/env node
/**
 * generate.js – scaffold a new day entry
 *
 * Usage:
 *   node scripts/generate.js          # auto-detects next day number
 *   node scripts/generate.js 04       # creates day-04/index.html
 *   node scripts/generate.js 04 "Snake Clone"
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function zeroPad(n) {
  return String(n).padStart(2, '0');
}

function nextDayNumber() {
  const dirs = fs.readdirSync(ROOT).filter(d => /^day-\d+$/.test(d));
  if (dirs.length === 0) return 1;
  const nums = dirs.map(d => parseInt(d.replace('day-', ''), 10));
  return Math.max(...nums) + 1;
}

function gameTemplate(dayNum, title) {
  const num = zeroPad(dayNum);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Day ${num} – Game a Day</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: system-ui, sans-serif;
      background: #0f0f1a;
      color: #e0e0ff;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }

    nav {
      width: 100%;
      max-width: 800px;
      margin-bottom: 2rem;
    }

    nav a {
      color: #a78bfa;
      text-decoration: none;
      font-size: 0.95rem;
    }

    nav a:hover { text-decoration: underline; }

    h1 {
      font-size: 2rem;
      color: #a78bfa;
      margin-bottom: 0.5rem;
    }

    p.subtitle {
      color: #9ca3af;
      margin-bottom: 2rem;
    }

    canvas {
      border: 2px solid #3b3b5c;
      border-radius: 8px;
      background: #1e1e2e;
    }
  </style>
</head>
<body>
  <nav><a href="../index.html">&larr; Back to gallery</a></nav>
  <h1>Day ${num}</h1>
  <p class="subtitle">${title} – work in progress</p>
  <canvas id="game" width="480" height="320"></canvas>

  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Day ${num} – work in progress', canvas.width / 2, canvas.height / 2);
  </script>
</body>
</html>
`;
}

function galleryCard(dayNum, title) {
  const num = zeroPad(dayNum);
  return `    <a class="card" href="day-${num}/index.html">
      <div class="day-number">${num}</div>
      <div class="day-label">Day ${dayNum}</div>
      <div class="day-title">${title}</div>
    </a>`;
}

function addCardToGallery(dayNum, title) {
  const indexPath = path.join(ROOT, 'index.html');
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, 'utf8');
  const marker = '</main>';
  const card = galleryCard(dayNum, title);

  if (html.includes(marker)) {
    html = html.replace(marker, `${card}\n  ${marker}`);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('  ✓ Added card to index.html');
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

const [, , argDay, ...titleWords] = process.argv;

const dayNum = argDay ? parseInt(argDay, 10) : nextDayNumber();
if (isNaN(dayNum) || dayNum < 1) {
  console.error('Invalid day number.');
  process.exit(1);
}

const title = titleWords.length ? titleWords.join(' ') : `Game ${zeroPad(dayNum)}`;
const dirName = `day-${zeroPad(dayNum)}`;
const dirPath = path.join(ROOT, dirName);
const filePath = path.join(dirPath, 'index.html');

if (fs.existsSync(filePath)) {
  console.error(`${filePath} already exists.`);
  process.exit(1);
}

fs.mkdirSync(dirPath, { recursive: true });
fs.writeFileSync(filePath, gameTemplate(dayNum, title), 'utf8');

console.log(`✓ Created ${dirName}/index.html`);
addCardToGallery(dayNum, title);
