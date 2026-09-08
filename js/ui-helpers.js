/**
 * Small shared UI utilities: element creation, escaping, toasts, and a
 * generic modal dialog used for confirmations and choice prompts.
 */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === 'class') node.className = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (key === 'checked' || key === 'disabled' || key === 'selected') node[key] = value;
    else node.setAttribute(key, value);
  });
  (Array.isArray(children) ? children : [children]).forEach(child => {
    if (child === null || child === undefined || child === false) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('toast--visible');
    toast.hidden = true;
  }, 2600);
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.hidden = true;
  document.getElementById('modal-content').innerHTML = '';
}

function openModal(contentNode) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = '';
  content.appendChild(contentNode);
  overlay.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }
});

/** Simple confirm dialog returning a Promise<boolean>. */
function confirmDialog(message, confirmLabel = 'Confirm') {
  return new Promise(resolve => {
    const wrapper = el('div', { class: 'modal-card' }, [
      el('p', {}, message),
      el('div', { class: 'modal-card__actions' }, [
        el('button', { class: 'btn btn--ghost', onclick: () => { closeModal(); resolve(false); } }, 'Cancel'),
        el('button', { class: 'btn btn--danger', onclick: () => { closeModal(); resolve(true); } }, confirmLabel)
      ])
    ]);
    openModal(wrapper);
  });
}
