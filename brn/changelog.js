// Simple changelog popup shown on every load
const changelogViews = {
  changelog: {
    title: 'GamePlaza / brn — A new chapter',
    meta: 'October 17, 2026',
    items: [
      "Nex brings the GamePlaza purple, violet, and pink palette to the arcade.",
      "The complete GamePlaza catalog joins the existing brn library.",
      "Barnacle preserves the original monochrome theme. Search, sorting, and recently played stay close at hand."
    ]
  },
  outage: {
    title: '**Outage notice**',
    meta: 'no current service interruption',
    items: [
      `remember to give feedback :3`,
    ],
  },
};

let activeChangelogView = 'changelog';
let changelogModalBound = false;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdown(text) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderMarkdown(text) {
  const blocks = String(text).replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const nonEmptyLines = lines.map((line) => line.trim()).filter(Boolean);
    const isList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^[-*]\s+/.test(line));

    if (isList) {
      return `<ul>${nonEmptyLines
        .map((line) => `<li>${formatInlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`)
        .join('')}</ul>`;
    }

    return `<p>${lines.map((line) => formatInlineMarkdown(line.trim())).join('<br>')}</p>`;
  }).join('');
}

function bindChangelogModal() {
  if (changelogModalBound) return;
  const backdrop = document.getElementById('changelog-backdrop');
  const closeBtn = document.getElementById('changelog-close');
  if (!backdrop || !closeBtn) return;

  const hide = () => backdrop.classList.add('modal-hidden');

  closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });

  changelogModalBound = true;
}

function renderView(viewName) {
  const backdrop = document.getElementById('changelog-backdrop');
  const list = document.getElementById('changelog-list');
  const meta = document.getElementById('changelog-meta');
  const title = document.getElementById('changelog-title');
  const changelogViewButton = document.getElementById('changelog-view-button');
  const outageViewButton = document.getElementById('outage-view-button');
  const view = changelogViews[viewName] || changelogViews.changelog;
  if (!backdrop || !list || !meta) return;
  activeChangelogView = viewName in changelogViews ? viewName : 'changelog';
  if (title) title.textContent = view.title;
  meta.textContent = view.meta;
  list.innerHTML = '';
  view.items.forEach((it) => {
    const li = document.createElement('li');
    const markdown = document.createElement('div');
    markdown.className = 'changelog-markdown';
    markdown.innerHTML = renderMarkdown(it);
    li.appendChild(markdown);
    list.appendChild(li);
  });
  if (changelogViewButton) changelogViewButton.classList.toggle('is-active', activeChangelogView === 'changelog');
  if (outageViewButton) outageViewButton.classList.toggle('is-active', activeChangelogView === 'outage');
  bindChangelogModal();
  backdrop.classList.remove('modal-hidden');
  // trap focus to close button for accessibility
  const closeBtn = document.getElementById('changelog-close');
  if (closeBtn) closeBtn.focus();
}

function showChangelog() {
  renderView('changelog');
}

function showOutageNotice() {
  renderView('outage');
}

const changelogViewButton = document.getElementById('changelog-view-button');
const outageViewButton = document.getElementById('outage-view-button');

if (changelogViewButton) {
  changelogViewButton.addEventListener('click', showChangelog);
}

if (outageViewButton) {
  outageViewButton.addEventListener('click', showOutageNotice);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showChangelog);
} else {
  showChangelog();
}

