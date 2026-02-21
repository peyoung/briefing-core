// モーダル開時のスクロール監視（600px 以上移動で自動クローズ）
const modalScrollHandlers = new Map();

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.js-sceneModal');
  if (!btn) return;
  const parent = btn.closest('.mainSection');
  if (!parent) return;

  const opened = parent.classList.toggle('is-modal');

  // 開いた場合は現在位置を記録してスクロール監視を追加
  if (opened) {
    const startY = window.scrollY;
    const handler = () => {
      if (Math.abs(window.scrollY - startY) >= 600) {
        parent.classList.remove('is-modal');
        const h = modalScrollHandlers.get(parent);
        if (h) {
          window.removeEventListener('scroll', h);
          modalScrollHandlers.delete(parent);
        }
      }
    };
    modalScrollHandlers.set(parent, handler);
    window.addEventListener('scroll', handler, { passive: true });
  } else {
    // 閉じた場合は監視を削除
    const h = modalScrollHandlers.get(parent);
    if (h) {
      window.removeEventListener('scroll', h);
      modalScrollHandlers.delete(parent);
    }
  }
});

document.addEventListener('click', (e) => {
  const closer = e.target.closest('.js-sceneModalClose');
  if (!closer) return;
  const parent = closer.closest('.mainSection');
  if (!parent) return;
  parent.classList.remove('is-modal');
  const h = modalScrollHandlers.get(parent);
  if (h) {
    window.removeEventListener('scroll', h);
    modalScrollHandlers.delete(parent);
  }
});
