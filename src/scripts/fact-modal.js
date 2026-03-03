// Fact モーダルの開閉制御
document.addEventListener('DOMContentLoaded', function () {
  const openButtons = document.querySelectorAll('.js-setFactModal');
  const closeButtons = document.querySelectorAll('.js-g-ModalClose');
  const fact = document.getElementById('fact');
  const wrapper = document.getElementById('g-wrapper');

  // スクロールによるコンテンツ切替/端で閉じる(closeItem)機能を無効化
  const ENABLE_SCROLL_SWITCH = false;

  let pendingTargetId = null;
  let scrollSettleTimer = null;
  let scrollListener = null;

  function openModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (fact) fact.classList.add('is-modal');
    if (wrapper) wrapper.classList.add('g-modalOpen');
    // モーダルオープン時: クリック時に保存した pendingTargetId があれば
    // - まず対象の .modalContent に is-active を付与して表示
    // - その後ハンドラー項目までスクロールし、スクロール完了後に監視を開始
    if (pendingTargetId) {
      const targetEl = document.getElementById(pendingTargetId);
      if (targetEl) targetEl.classList.add('is-active');
      initiateScrollThenObserve(pendingTargetId);
    } else {
      // ターゲット指定が無い場合も、何か1つ表示されるようにする
      const first = fact ? fact.querySelector('.modalContent') : null;
      if (first && first.id) setActiveContent(first.id);
      startInviewObserver();
    }
  }

  function closeModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (fact) fact.classList.remove('is-modal');
    if (wrapper) wrapper.classList.remove('g-modalOpen');
    // モーダルクローズ時に監視停止・状態クリア
    stopInviewObserver();
  }

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

  if (closeButtons.length) {
    closeButtons.forEach((btn) => btn.addEventListener('click', closeModal));
  }

  // .js-factClose ボタンでモーダルを閉じる
  const factCloseButtons = document.querySelectorAll('.js-factClose');
  if (factCloseButtons.length) {
    factCloseButtons.forEach((btn) => btn.addEventListener('click', closeModal));
  }

  // .js-factMove ボタンでモーダル内を移動
  const moveButtons = document.querySelectorAll('.js-factMove');
  if (moveButtons.length) {
    moveButtons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const targetId = btn.getAttribute('data-target') || btn.dataset.target || null;
        if (!targetId) return;

        // 先に表示を落として、スクロール完了後に is-active を付与する（チラつき防止）
        document
          .querySelectorAll('.modalContent.is-active')
          .forEach((el) => el.classList.remove('is-active'));
        lastActiveId = null;
        visibleMap.clear();

        // スクロール完了後に対象をアクティブ化してから監視を開始
        initiateScrollThenObserve(targetId, { activateAfterScroll: true });
      });
    });
  }

  // ---- inview 判定 (GSAP 不使用) ----
  let inviewObserver = null;
  let visibleMap = new Map(); // targetId -> intersectionRatio
  let lastActiveId = null;

  function setActiveContent(targetId) {
    document
      .querySelectorAll('.modalContent.is-active')
      .forEach((el) => el.classList.remove('is-active'));
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.add('is-active');
      lastActiveId = targetId;
    }
  }

  function onInview(entries) {
    // entries は変化があった要素のみ。状態を visibleMap に反映してから
    // 現在表示されている項目の中で intersectionRatio が最大のもののみを is-active にする
    entries.forEach((entry) => {
      const item = entry.target;
      const isCloseItem = item.classList && item.classList.contains('closeItem');
      if (isCloseItem) {
        if (entry.isIntersecting) closeModal();
        return;
      }

      const targetId = item.getAttribute('data-target') || item.dataset.target;
      if (!targetId) return;

      if (entry.isIntersecting) {
        visibleMap.set(targetId, entry.intersectionRatio || 0);
      } else {
        visibleMap.delete(targetId);
      }
    });

    // visibleMap の中から最大のものを選ぶ
    let maxId = null;
    let maxRatio = -1;
    visibleMap.forEach((ratio, id) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        maxId = id;
      }
    });
    // maxId があればそれを唯一の is-active にする。
    // maxId が無い場合（visibleMap が空）は、直前の lastActiveId を維持する。
    if (maxId) {
      if (lastActiveId !== maxId) {
        document
          .querySelectorAll('.modalContent.is-active')
          .forEach((el) => el.classList.remove('is-active'));
        const el = document.getElementById(maxId);
        if (el) el.classList.add('is-active');
        lastActiveId = maxId;
      }
    } else if (lastActiveId) {
      // まだ lastActiveId があればそれを維持し、他の is-active を削除
      document.querySelectorAll('.modalContent.is-active').forEach((el) => {
        if (el.id !== lastActiveId) el.classList.remove('is-active');
      });
    }
  }

  function startInviewObserver() {
    if (!ENABLE_SCROLL_SWITCH) return;
    const scroller = document.querySelector('.g-modalScroller');
    if (!scroller) return;
    const items = scroller.querySelectorAll('.handler .item, .handler .closeItem');
    if (!items.length) return;

    // 既に作成済みなら一旦切断
    if (inviewObserver) inviewObserver.disconnect();

    inviewObserver = new IntersectionObserver(onInview, {
      root: scroller,
      threshold: 0.2,
    });

    items.forEach((it) => inviewObserver.observe(it));
  }

  // スクロールしてから監視を開始するユーティリティ
  function initiateScrollThenObserve(targetId, options = {}) {
    const { activateAfterScroll = false } = options;

    function activateTarget() {
      setActiveContent(targetId);
    }

    // 既存の observer があれば一旦停止しておく（スクロール中の干渉を防ぐ）
    if (inviewObserver) {
      inviewObserver.disconnect();
      inviewObserver = null;
    }
    const scroller = document.querySelector('.g-modalScroller');
    if (!scroller) {
      startInviewObserver();
      pendingTargetId = null;
      return;
    }

    const items = scroller.querySelectorAll('.handler .item');
    const targetItem = Array.from(items).find((it) => {
      return (it.getAttribute('data-target') || it.dataset.target) === targetId;
    });

    // 対象項目がない場合は監視開始して終了
    if (!targetItem) {
      if (activateAfterScroll) activateTarget();
      startInviewObserver();
      pendingTargetId = null;
      return;
    }

    // 既存のリスナをクリア
    if (scrollListener) {
      scroller.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }
    if (scrollSettleTimer) {
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = null;
    }

    // スクロール終了を検知するためのリスナ
    scrollListener = function () {
      if (scrollSettleTimer) clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(function () {
        if (scrollListener) {
          scroller.removeEventListener('scroll', scrollListener);
          scrollListener = null;
        }
        scrollSettleTimer = null;
        if (activateAfterScroll) activateTarget();
        // スクロール完了後に監視開始
        startInviewObserver();
        pendingTargetId = null;
      }, 150);
    };

    scroller.addEventListener('scroll', scrollListener);

    // フォールバック: 1.2s 経過後は強制的に監視開始
    setTimeout(function () {
      if (scrollListener) {
        scroller.removeEventListener('scroll', scrollListener);
        scrollListener = null;
      }
      if (scrollSettleTimer) {
        clearTimeout(scrollSettleTimer);
        scrollSettleTimer = null;
      }
      if (activateAfterScroll) activateTarget();
      if (!inviewObserver) startInviewObserver();
      pendingTargetId = null;
    }, 1200);

    // 最後にスクロール実行（監視はまだ開始しない）
    targetItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function stopInviewObserver() {
    if (inviewObserver) {
      inviewObserver.disconnect();
      inviewObserver = null;
    }
    // pendingTargetId をクリア
    pendingTargetId = null;
    // モーダルのコンテンツ要素（.modalContent）の is-active のみクリア
    document
      .querySelectorAll('.modalContent.is-active')
      .forEach((el) => el.classList.remove('is-active'));
  }
});
