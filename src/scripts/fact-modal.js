// Fact モーダルの開閉制御（シンプルなタブ切り替え）
document.addEventListener('DOMContentLoaded', function () {
  const openButtons = document.querySelectorAll('.js-setFactModal');
  const closeButtons = document.querySelectorAll('.js-g-ModalClose');
  const moveButtons = document.querySelectorAll('.js-factMove');
  const factCloseButtons = document.querySelectorAll('.js-factClose');
  const fact = document.getElementById('fact');
  const wrapper = document.getElementById('g-wrapper');

  // modal 内コンテンツ（タブ）
  function getFactModalRoot() {
    const sample =
      document.getElementById('factGeeky') ||
      document.getElementById('factCrafted') ||
      document.getElementById('factPlayful');
    return (sample && sample.closest('.g-modalScroller')) || document;
  }

  function getModalContents() {
    const root = getFactModalRoot();
    return Array.from(root.querySelectorAll('.modalContent[id^="fact"]'));
  }

  let pendingTargetId = null;
  const TAB_SWITCH_COOLDOWN_MS = 320;

  let switchUnlockTimer = null;
  let isSwitchLocked = false;

  function deactivateAllContents() {
    // ここで制御するクラスは is-activeTab のみ
    // ただし過去実装の is-active が残っていると見た目が崩れるので、念のため掃除する
    getModalContents().forEach((el) => {
      el.classList.remove('is-activeTab');
      el.classList.remove('is-active');
    });
  }

  function clearSwitchLockTimer() {
    if (switchUnlockTimer) {
      window.clearTimeout(switchUnlockTimer);
      switchUnlockTimer = null;
    }
  }

  function lockTabSwitch() {
    isSwitchLocked = true;
    clearSwitchLockTimer();
    switchUnlockTimer = window.setTimeout(() => {
      isSwitchLocked = false;
      switchUnlockTimer = null;
    }, TAB_SWITCH_COOLDOWN_MS);
  }

  function activateContent(targetId) {
    if (isSwitchLocked) return false;

    const activeId = getActiveTabId();
    if (activeId && activeId === targetId) return false;

    // カレント以外のタブアクティブ状態を必ず削除
    deactivateAllContents();
    if (!targetId) return false;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return false;
    targetEl.classList.add('is-activeTab');
    lockTabSwitch();
    return true;
  }

  function isModalOpen() {
    return (
      (fact && fact.classList.contains('is-modal')) ||
      (wrapper && wrapper.classList.contains('g-modalOpen'))
    );
  }

  function getTabIdsInOrder() {
    return getModalContents()
      .map((el) => el && el.id)
      .filter(Boolean);
  }

  function getActiveTabId() {
    const root = getFactModalRoot();
    const active = root.querySelector('.modalContent.is-activeTab');
    return active && active.id ? active.id : null;
  }

  function activateNextTab(direction) {
    const tabIds = getTabIdsInOrder();
    if (!tabIds.length) return;
    const activeId = getActiveTabId();
    if (!activeId) return;

    const currentIndex = tabIds.indexOf(activeId);
    if (currentIndex === -1) return;

    const delta = direction === 'prev' ? -1 : 1;
    const nextIndex = (currentIndex + delta + tabIds.length) % tabIds.length;
    activateContent(tabIds[nextIndex]);
  }

  function openModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (fact) fact.classList.add('is-modal');
    if (wrapper) wrapper.classList.add('g-modalOpen');
    clearSwitchLockTimer();
    isSwitchLocked = false;

    // 指定があるときだけ表示する（デフォルトは全て非表示）
    if (pendingTargetId) {
      activateContent(pendingTargetId);
      pendingTargetId = null;
    }
  }

  function closeModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (fact) fact.classList.remove('is-modal');
    if (wrapper) wrapper.classList.remove('g-modalOpen');
    pendingTargetId = null;
    clearSwitchLockTimer();
    isSwitchLocked = false;
    deactivateAllContents();
  }

  // 初期状態：すべて非表示
  deactivateAllContents();

  // 外部スクリプトから Fact モーダルを閉じられるようにする
  // 例: document.dispatchEvent(new CustomEvent('factModal:close'))
  document.addEventListener('factModal:close', closeModal);

  if (openButtons.length) {
    openButtons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        pendingTargetId = btn.getAttribute('data-target') || btn.dataset.target || null;
        openModal(e);
      });
    });
  }

  if (moveButtons.length) {
    moveButtons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const targetId = btn.getAttribute('data-target') || btn.dataset.target || null;
        if (!targetId) return;
        activateContent(targetId);
      });
    });
  }

  if (closeButtons.length) {
    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));
  }

  if (factCloseButtons.length) {
    factCloseButtons.forEach((btn) => btn.addEventListener('click', closeModal));
  }

  // ---- タッチデバイス: 左右スワイプでタブ切替 ----
  (function setupSwipeToSwitchTabs() {
    const swipeRoot = getFactModalRoot();
    if (!(swipeRoot instanceof Element)) return;

    const SWIPE_THRESHOLD_PX = 40;
    const SWIPE_MAX_TIME_MS = 700;
    const SWIPE_AXIS_LOCK_PX = 12;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;
    let isHorizontalGesture = false;
    let isVerticalGesture = false;

    function reset() {
      tracking = false;
      startX = 0;
      startY = 0;
      startTime = 0;
      isHorizontalGesture = false;
      isVerticalGesture = false;
    }

    function shouldHandleSwipe(dx, dy, dt) {
      if (!isModalOpen()) return false;
      if (isSwitchLocked) return false;
      if (dt > SWIPE_MAX_TIME_MS) return false;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return false;
      // 縦スクロール優位なら無視
      if (Math.abs(dy) >= Math.abs(dx)) return false;
      return true;
    }

    // Touch Events
    swipeRoot.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        const t = e.touches[0];
        tracking = true;
        startX = t.clientX;
        startY = t.clientY;
        startTime = Date.now();
        isHorizontalGesture = false;
        isVerticalGesture = false;
      },
      { passive: true }
    );

    swipeRoot.addEventListener(
      'touchmove',
      (e) => {
        if (!tracking) return;
        if (!e.touches || e.touches.length !== 1) {
          reset();
          return;
        }

        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        if (!isHorizontalGesture && !isVerticalGesture) {
          if (Math.abs(dx) >= SWIPE_AXIS_LOCK_PX && Math.abs(dx) > Math.abs(dy)) {
            isHorizontalGesture = true;
          } else if (Math.abs(dy) >= SWIPE_AXIS_LOCK_PX && Math.abs(dy) >= Math.abs(dx)) {
            isVerticalGesture = true;
            reset();
          }
        }
      },
      { passive: true }
    );

    swipeRoot.addEventListener(
      'touchend',
      (e) => {
        if (!tracking) return;
        if (!e.changedTouches || e.changedTouches.length !== 1) {
          reset();
          return;
        }
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const dt = Date.now() - startTime;

        if (isHorizontalGesture && shouldHandleSwipe(dx, dy, dt)) {
          // 左スワイプ: 次 / 右スワイプ: 前
          if (dx < 0) activateNextTab('next');
          else activateNextTab('prev');
        }
        reset();
      },
      { passive: true }
    );

    swipeRoot.addEventListener(
      'touchcancel',
      () => {
        reset();
      },
      { passive: true }
    );
  })();
});
