// Simple changelog popup shown on every load
const changelog = {
  version: '2026-07-01',
  items: [
    'Barnical v3',
    '10+ new games (around i think)',
    'live chat',
    'new UI (User interface)',
    'themes',
    'thumbnails for games',
    'Catergories',
    'Suprise me and new upgraded searching',
    'Sort by ...',
    'shows how much people have played a certain game',
    'and more!, If you have any feedback feel free to use the feedback button under changelog button in the bottom left.',
]
};

function showChangelog() {
  const backdrop = document.getElementById('changelog-backdrop');
  const list = document.getElementById('changelog-list');
  const meta = document.getElementById('changelog-meta');
  if (!backdrop || !list || !meta) return;
  meta.textContent = `Version: ${changelog.version}`;
  list.innerHTML = '';
  changelog.items.forEach(it => {
    const li = document.createElement('li');
    li.textContent = it;
    list.appendChild(li);
  });
  backdrop.classList.remove('modal-hidden');
  // trap focus to close button for accessibility
  const closeBtn = document.getElementById('changelog-close');
  if (closeBtn) closeBtn.focus();

  function hide() { backdrop.classList.add('modal-hidden'); }
  document.getElementById('changelog-close').addEventListener('click', hide);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showChangelog);
} else {
  showChangelog();
}
