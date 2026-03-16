(function () {
  const BASE = getBasePath();
  let games = [];
  let currentIndex = -1;
  let howToPlay = '';

  function getBasePath() {
    const path = window.location.pathname;
    const parts = path.split('/');
    // We're inside a game folder like /day-01/index.html
    // so base is one level up
    const dirIndex = parts.length - 2;
    const dir = parts[dirIndex];
    if (dir && (dir.startsWith('day-') || dir.startsWith('game-'))) {
      return '../';
    }
    return './';
  }

  function getCurrentDir() {
    const path = window.location.pathname;
    const parts = path.split('/').filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i].startsWith('day-') || parts[i].startsWith('game-')) {
        return parts[i];
      }
    }
    return null;
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .gad-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: #0f0f1a;
        border-bottom: 1px solid #3b3b5c;
        font-family: system-ui, -apple-system, sans-serif;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }
      .gad-header * { box-sizing: border-box; margin: 0; padding: 0; }
      .gad-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
        max-width: 100%;
      }
      .gad-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1e1e2e;
        color: #a78bfa;
        border: 1px solid #3b3b5c;
        border-radius: 8px;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
        text-decoration: none;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        white-space: nowrap;
        min-height: 44px;
        min-width: 44px;
        -webkit-tap-highlight-color: transparent;
      }
      .gad-btn:hover, .gad-btn:active {
        border-color: #a78bfa;
        background: #2a2a3e;
      }
      .gad-btn.disabled {
        opacity: 0.25;
        pointer-events: none;
      }
      .gad-title {
        flex: 1;
        text-align: center;
        color: #e0e0ff;
        font-size: 1rem;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
      .gad-help-toggle {
        background: none;
        border: 1px solid #3b3b5c;
        border-radius: 50%;
        color: #a78bfa;
        width: 36px;
        height: 36px;
        min-width: 36px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
        transition: border-color 0.15s, background 0.15s;
      }
      .gad-help-toggle:hover, .gad-help-toggle:active {
        border-color: #a78bfa;
        background: #1e1e2e;
      }
      .gad-help-toggle.active {
        background: #a78bfa;
        color: #0f0f1a;
        border-color: #a78bfa;
      }
      .gad-help-panel {
        display: none;
        background: #1a1a2e;
        border-top: 1px solid #3b3b5c;
        padding: 0.75rem 1rem;
        color: #c0c0e0;
        font-size: 0.85rem;
        line-height: 1.5;
        max-height: 40vh;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      .gad-help-panel.open { display: block; }
      .gad-spacer {
        height: 52px;
      }
      @media (min-width: 600px) {
        .gad-bar { padding: 0.5rem 1.5rem; }
        .gad-title { font-size: 1.1rem; }
      }
    `;
    document.head.appendChild(style);
  }

  function extractHowToPlay() {
    // Look for common patterns: .info div, instructions, how-to-play, subtitle
    const selectors = [
      '#info', '.info', '#instructions', '.instructions',
      '#how-to-play', '.how-to-play', '#controls', '.controls',
      '.subtitle'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.textContent.trim().length > 5) {
        return el.textContent.trim();
      }
    }
    // Fallback: look for text mentioning controls
    const allEls = document.querySelectorAll('p, div, span');
    for (const el of allEls) {
      const t = el.textContent.trim().toLowerCase();
      if ((t.includes('click') || t.includes('tap') || t.includes('arrow') ||
           t.includes('wasd') || t.includes('space') || t.includes('drag')) &&
          t.length < 200 && t.length > 10) {
        return el.textContent.trim();
      }
    }
    return '';
  }

  function buildHeader() {
    const dir = getCurrentDir();
    if (!dir) return;

    currentIndex = games.findIndex(g => g.dir === dir);
    if (currentIndex === -1) return;

    const game = games[currentIndex];
    const prev = currentIndex > 0 ? games[currentIndex - 1] : null;
    const next = currentIndex < games.length - 1 ? games[currentIndex + 1] : null;

    howToPlay = extractHowToPlay();

    // Remove any existing nav-bar or nav elements the old system added
    document.querySelectorAll('.nav-bar, nav').forEach(el => el.remove());

    const header = document.createElement('div');
    header.className = 'gad-header';

    const bar = document.createElement('div');
    bar.className = 'gad-bar';

    // Prev button
    const prevBtn = document.createElement('a');
    prevBtn.className = 'gad-btn' + (prev ? '' : ' disabled');
    prevBtn.href = prev ? BASE + prev.dir + '/index.html' : '#';
    prevBtn.innerHTML = '&#9664;';
    prevBtn.setAttribute('aria-label', 'Previous game');

    // Home button
    const homeBtn = document.createElement('a');
    homeBtn.className = 'gad-btn';
    homeBtn.href = BASE + 'index.html';
    homeBtn.innerHTML = '&#8962;';
    homeBtn.setAttribute('aria-label', 'Home');

    // Title
    const title = document.createElement('div');
    title.className = 'gad-title';
    title.textContent = game.title;

    // Help toggle
    const helpBtn = document.createElement('button');
    helpBtn.className = 'gad-help-toggle';
    helpBtn.textContent = '?';
    helpBtn.setAttribute('aria-label', 'How to play');

    // Next button
    const nextBtn = document.createElement('a');
    nextBtn.className = 'gad-btn' + (next ? '' : ' disabled');
    nextBtn.href = next ? BASE + next.dir + '/index.html' : '#';
    nextBtn.innerHTML = '&#9654;';
    nextBtn.setAttribute('aria-label', 'Next game');

    bar.appendChild(prevBtn);
    bar.appendChild(homeBtn);
    bar.appendChild(title);
    bar.appendChild(helpBtn);
    bar.appendChild(nextBtn);
    header.appendChild(bar);

    // Help panel
    const panel = document.createElement('div');
    panel.className = 'gad-help-panel';
    panel.textContent = howToPlay || 'No instructions found for this game.';
    header.appendChild(panel);

    helpBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      panel.classList.toggle('open');
      helpBtn.classList.toggle('active');
    });

    // Spacer to push page content below fixed header
    const spacer = document.createElement('div');
    spacer.className = 'gad-spacer';

    document.body.insertBefore(spacer, document.body.firstChild);
    document.body.insertBefore(header, document.body.firstChild);
  }

  function init() {
    injectStyles();

    fetch(BASE + 'games.json')
      .then(r => r.json())
      .then(data => {
        games = data;
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', buildHeader);
        } else {
          buildHeader();
        }
      })
      .catch(() => {
        // Silently fail if games.json not available
      });
  }

  init();
})();
