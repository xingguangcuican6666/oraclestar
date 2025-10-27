export function setupButton(btnId, callback) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', callback);
  }
}
export function openInNewTab(btnId, url) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', () => {
      window.open(url, '_blank');
    });
  }
}
