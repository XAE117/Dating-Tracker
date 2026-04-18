let container = null;

function getContainer() {
  if (container) return container;
  container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position:fixed;top:env(safe-area-inset-top,12px);left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:90%;max-width:400px;';
  document.body.appendChild(container);
  return container;
}

export function showToast(message, type = 'info') {
  const el = document.createElement('div');
  const colors = {
    success: 'background:#065f46;color:#6ee7b7;border:1px solid #047857',
    error: 'background:#7f1d1d;color:#fca5a5;border:1px solid #991b1b',
    info: 'background:#1e3a5f;color:#93c5fd;border:1px solid #1e40af',
  };
  el.style.cssText = `${colors[type] || colors.info};padding:12px 16px;border-radius:12px;font-size:14px;pointer-events:auto;opacity:0;transition:opacity 0.2s;text-align:center;`;
  el.textContent = message;
  getContainer().appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; });
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 200);
  }, 3000);
}
