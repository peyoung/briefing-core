// fact.js
// Minimal implementation: click .js-setFactModal → open .factModalContent and scroll target
// Keep scroll-sync: when .scrollItem hits top, set corresponding .factSlider .item is-active
// Center active item and handle resize. Cleanup when modal loses is-active via MutationObserver.

const state = {
  scrollHandler: null,
  resizeHandler: null,
  mutationObserver: null,
  currentFactContent: null,
  lastActiveIndex: -1,
  locked: false,
  // drag state
  drag: { pointerId: null, startX: 0, startY: 0, moved: false, isHorizontal: false },
  dragHandlers: null,
  // element we forced to display:block (clear on teardown)
  forcedDisplayEl: null,
  // when true, skip close-on-edge checks
  suppressClose: false,
};

function getIndexOfTrigger(trigger) {
  const section = trigger.closest('#fact');
  if (!section) return -1;
  const buttons = section.querySelectorAll('.js-setFactModal');
  return Array.from(buttons).indexOf(trigger);
}

function scrollToTopOfElement(target) {
  if (!target) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(() => {
      const rect = target.getBoundingClientRect();
      const y = rect.top + window.scrollY;
      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        try {
          window.lenis.scrollTo(target);
        } catch (e) {
          try {
            window.lenis.scrollTo(y);
          } catch (e2) {
            window.scrollTo({ top: y, behavior: 'auto' });
          }
        }
      } else if (typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'start', behavior: 'auto' });
        window.scrollTo({ top: y, behavior: 'auto' });
      } else {
        window.scrollTo({ top: y, behavior: 'auto' });
      }

      // micro-adjust
      let attempts = 0;
      const adjust = () => {
        const r = target.getBoundingClientRect();
        if (Math.abs(r.top) <= 1 || attempts >= 8) {
          resolve();
          return;
        }
        const yy = r.top + window.scrollY;
        window.scrollTo({ top: yy, behavior: 'auto' });
        attempts++;
        requestAnimationFrame(adjust);
      };
      requestAnimationFrame(adjust);
    }, 50);
  });
}

function findClosestScrollItemIndex(factContent) {
  const items = factContent.querySelectorAll('.scrollItem');
  if (!items || items.length === 0) return -1;
  let best = Infinity,
    idx = -1;
  items.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const d = Math.abs(r.top);
    if (d < best) {
      best = d;
      idx = i;
    }
  });
  return idx;
}

function centerActiveItem(index, instant = false) {
  const slider = document.querySelector('.factSlider');
  if (!slider) return;
  const inner = slider.querySelector(':scope > .inner') || slider;
  const items = inner.querySelectorAll('.item');
  if (!items || items.length === 0) return;
  if (index < 0 || index >= items.length) return;

  const active = items[index];
  const windowCenter = window.innerWidth / 2;
  const ar = active.getBoundingClientRect();
  const activeCenter = ar.left + ar.width / 2;

  const style = window.getComputedStyle(inner).transform;
  let currentX = 0;
  if (style && style !== 'none') {
    try {
      currentX = new DOMMatrixReadOnly(style).m41;
    } catch (e) {
      try {
        currentX = new WebKitCSSMatrix(style).m41;
      } catch (e2) {
        currentX = 0;
      }
    }
  }

  const diff = windowCenter - activeCenter;
  const newX = currentX + diff;
  if (instant) {
    // apply transform without transition
    inner.style.transition = 'none';
    inner.style.transform = `translateX(${newX}px)`;
    // force reflow
    inner.getBoundingClientRect();
  } else {
    inner.style.transition = 'transform 0.45s cubic-bezier(0.25,1,0.5,1)';
    inner.style.transform = `translateX(${newX}px)`;
  }
}

function updateSliderActive(index, instant = false) {
  const slider = document.querySelector('.factSlider');
  if (!slider) return;
  const inner = slider.querySelector(':scope > .inner') || slider;
  const items = inner.querySelectorAll('.item');
  if (!items || items.length === 0) return;
  if (index < 0 || index >= items.length) return;
  if (state.lastActiveIndex === index) return;
  items.forEach((it, i) => it.classList.toggle('is-active', i === index));
  centerActiveItem(index, instant);
  state.lastActiveIndex = index;
}

function setupScrollSync(factContent) {
  if (!factContent) return;
  if (state.scrollHandler) return;
  state.lastActiveIndex = -1;
  state.scrollHandler = () => {
    // if user is actively dragging or we suppressed close for programmatic scroll, ignore close checks
    if ((state.drag && state.drag.pointerId) || state.suppressClose) return;
    // close-on-edge: first item moved below viewport OR last item moved above viewport
    const items = factContent.querySelectorAll('.scrollItem');
    if (items && items.length > 0) {
      const firstRect = items[0].getBoundingClientRect();
      // close when first item fully scrolled below viewport
      if (firstRect.top >= window.innerHeight) {
        closeModal();
        return;
      }
      // close when the whole scroller (.factScroller) moved above viewport
      const scroller = factContent.querySelector('.factScroller');
      if (scroller) {
        const scRect = scroller.getBoundingClientRect();
        if (scRect.bottom <= 0) {
          closeModal();
          return;
        }
      }
    }

    const idx = findClosestScrollItemIndex(factContent);
    if (idx !== -1) updateSliderActive(idx);
  };
  window.addEventListener('scroll', state.scrollHandler, { passive: true });
  // initial
  setTimeout(() => state.scrollHandler(), 40);

  // observe class removal to teardown when modal is closed externally
  state.mutationObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.attributeName === 'class') {
        if (!factContent.classList.contains('is-active')) {
          teardown();
        }
      }
    }
  });
  state.mutationObserver.observe(factContent, { attributes: true });
  // setup drag handlers for simple ±1 navigation
  setupDragHandlers(factContent);
}

function setupDragHandlers(factContent) {
  if (!factContent) return;
  // remove existing handlers first
  teardownDragHandlers();
  const area = factContent.querySelector('.modalContent') || factContent;
  try {
    area.style.touchAction = 'pan-y';
  } catch (e) {}

  const onPointerDown = (ev) => {
    if (!(ev instanceof PointerEvent)) return;
    state.drag.pointerId = ev.pointerId;
    state.drag.startX = ev.clientX;
    state.drag.startY = ev.clientY;
    state.drag.moved = false;
    state.drag.isHorizontal = false;
    // suppress close checks while user is interacting
    state.suppressClose = true;
    try {
      ev.target && ev.target.setPointerCapture && ev.target.setPointerCapture(ev.pointerId);
    } catch (e) {}
  };

  const onPointerMove = (ev) => {
    if (state.drag.pointerId !== ev.pointerId) return;
    const dx = ev.clientX - state.drag.startX;
    const dy = ev.clientY - state.drag.startY;
    if (!state.drag.moved) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      state.drag.isHorizontal = Math.abs(dx) > Math.abs(dy);
      state.drag.moved = true;
    }
    if (state.drag.isHorizontal) {
      try {
        ev.preventDefault();
      } catch (e) {}
    }
  };

  const onPointerUp = async (ev) => {
    if (state.drag.pointerId !== ev.pointerId) return;
    try {
      ev.target && ev.target.releasePointerCapture && ev.target.releasePointerCapture(ev.pointerId);
    } catch (e) {}
    const dx = ev.clientX - state.drag.startX;
    const abs = Math.abs(dx);
    const THRESH = 50;
    if (state.drag.isHorizontal && abs >= THRESH && state.currentFactContent === factContent) {
      if (!state.locked) {
        state.locked = true;
        const items = factContent.querySelectorAll('.scrollItem');
        if (items && items.length > 0) {
          const current =
            typeof state.lastActiveIndex === 'number' && state.lastActiveIndex >= 0
              ? state.lastActiveIndex
              : findClosestScrollItemIndex(factContent);
          let next = current;
          if (dx < 0) next = Math.min(items.length - 1, current + 1);
          else next = Math.max(0, current - 1);
          if (next !== current) {
            await scrollToTopOfElement(items[next]);
            const idx = findClosestScrollItemIndex(factContent);
            if (idx !== -1) updateSliderActive(idx);
            // allow a short grace period before re-enabling close checks
            setTimeout(() => {
              state.suppressClose = false;
            }, 80);
          }
        }
        state.locked = false;
      }
    }
    // ensure suppressClose is cleared if no navigation happened
    state.suppressClose = false;
    state.drag.pointerId = null;
    state.drag.moved = false;
    state.drag.isHorizontal = false;
  };

  area.addEventListener('pointerdown', onPointerDown, { passive: true });
  area.addEventListener('pointermove', onPointerMove, { passive: false });
  area.addEventListener('pointerup', onPointerUp, { passive: true });
  area.addEventListener('pointercancel', onPointerUp, { passive: true });

  state.dragHandlers = { area, onPointerDown, onPointerMove, onPointerUp };
}

function teardownDragHandlers() {
  const h = state.dragHandlers;
  if (!h) return;
  try {
    h.area.removeEventListener('pointerdown', h.onPointerDown);
    h.area.removeEventListener('pointermove', h.onPointerMove, { passive: false });
    h.area.removeEventListener('pointerup', h.onPointerUp);
    h.area.removeEventListener('pointercancel', h.onPointerUp);
    h.area.style.touchAction = '';
  } catch (e) {}
  state.dragHandlers = null;
  state.drag.pointerId = null;
  state.drag.moved = false;
  state.drag.isHorizontal = false;
}

function closeModal() {
  const fc = state.currentFactContent;
  if (fc) fc.classList.remove('is-active');
  // remove is-modal from parent mainSection if present
  try {
    const section = fc ? fc.closest('.mainSection') || fc.closest('#fact') : null;
    if (section) section.classList.remove('is-modal');
  } catch (e) {}
  teardown();
}

function setupResize() {
  if (state.resizeHandler) return;
  state.resizeHandler = () => {
    const fc = state.currentFactContent;
    if (!fc) return;
    const idx = findClosestScrollItemIndex(fc);
    if (idx !== -1) centerActiveItem(idx);
  };
  window.addEventListener('resize', state.resizeHandler);
}

function teardown() {
  if (state.scrollHandler) {
    window.removeEventListener('scroll', state.scrollHandler);
    state.scrollHandler = null;
  }
  if (state.resizeHandler) {
    window.removeEventListener('resize', state.resizeHandler);
    state.resizeHandler = null;
  }
  if (state.mutationObserver) {
    state.mutationObserver.disconnect();
    state.mutationObserver = null;
  }
  teardownDragHandlers();
  try {
    if (state.forcedDisplayEl) {
      // ensure closed state is display:none as requested
      state.forcedDisplayEl.style.display = 'none';
      state.forcedDisplayEl = null;
    }
  } catch (e) {}
  // refresh ScrollTrigger after hiding modal to keep triggers consistent
  try {
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
  } catch (e) {}
  state.currentFactContent = null;
  state.lastActiveIndex = -1;
}

// Click handler: open modal and scroll to matching scrollItem
document.addEventListener('click', (e) => {
  (async () => {
    const trigger = e.target instanceof Element ? e.target.closest('.js-setFactModal') : null;
    if (!trigger) return;
    const section = trigger.closest('#fact');
    if (!section) return;
    const factContent = section.querySelector('.factModalContent');
    if (!factContent) return;

    // prevent re-entrant open/close
    if (state.locked) return;
    state.locked = true;

    // disable toggle triggers (they can mis-evaluate when we change layout)
    try {
      if (window.__toggleTriggers && Array.isArray(window.__toggleTriggers)) {
        window.__toggleTriggers.forEach((t) => t.disable());
        state.toggleDisabled = true;
      }
    } catch (e) {}

    // ensure display:block first, then add is-active so any GSAP or CSS depending on .is-active sees rendered elements
    try {
      factContent.style.display = 'block';
      state.forcedDisplayEl = factContent;
    } catch (e) {}
    try {
      const main = section.closest('.mainSection') || section;
      if (main) main.classList.add('is-modal');
    } catch (e) {}
    // set is-active now (after display so render is available)
    factContent.classList.add('is-active');
    // suppress close checks during open sequence
    state.suppressClose = true;

    // wait for layout to apply (two frames)
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // refresh GSAP ScrollTrigger after display/layout change so triggers recalc correctly
    try {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      } else if (window.gsap && window.gsap.core && window.gsap.core.Globals) {
        const ST = window.gsap && window.gsap.plugins && window.gsap.plugins.ScrollTrigger;
        if (ST && typeof ST.refresh === 'function') ST.refresh();
      }
      // re-enable toggle triggers that were disabled earlier
      if (
        state.toggleDisabled &&
        window.__toggleTriggers &&
        Array.isArray(window.__toggleTriggers)
      ) {
        window.__toggleTriggers.forEach((t) => t.enable());
        state.toggleDisabled = false;
      }
    } catch (e) {}

    // target the inner modalContent for fade; fall back to factContent
    const modalContent = factContent.querySelector('.modalContent') || factContent;
    // start hidden until scroll & positioning complete
    modalContent.style.opacity = '0';
    modalContent.style.visibility = 'hidden';
    state.currentFactContent = factContent;
    setupResize();
    // enable simple drag handlers after layout ready
    setupDragHandlers(factContent);

    const idx = getIndexOfTrigger(trigger);
    if (idx >= 0) {
      const items = factContent.querySelectorAll('.scrollItem');
      const target = items[idx];
      if (target) await scrollToTopOfElement(target);
    }

    // abort if closed while we were positioning
    if (!factContent.classList.contains('is-active') || state.currentFactContent !== factContent) {
      state.locked = false;
      state.suppressClose = false;
      return;
    }

    // now start scroll sync after initial positioning to avoid immediate close
    setupScrollSync(factContent);

    // position slider instantly before revealing
    const positionedIdx = findClosestScrollItemIndex(factContent);
    if (positionedIdx !== -1) updateSliderActive(positionedIdx, true);

    // ensure slider active updated after scroll (safety)
    if (state.scrollHandler) state.scrollHandler();

    // reveal: make visible then fade in
    modalContent.style.visibility = 'visible';
    requestAnimationFrame(() => {
      modalContent.style.transition = modalContent.style.transition || 'opacity 0.35s ease';
      modalContent.style.opacity = '1';
      setTimeout(() => {
        modalContent.style.transition = '';
        modalContent.style.opacity = '';
        // clear inner transition so future centerActiveItem uses configured transition
        const inner = modalContent.querySelector('.factSlider > .inner');
        if (inner) inner.style.transition = '';
        state.locked = false;
        state.suppressClose = false;
      }, 400);
    });
  })();
});

// Manual close button: rely on MutationObserver to teardown when closed externally
document.addEventListener('click', (e) => {
  const closer = e.target instanceof Element ? e.target.closest('.js-factModalClose') : null;
  if (!closer) return;
  const section = closer.closest('#fact');
  if (!section) return;
  const fc = section.querySelector('.factModalContent');
  if (!fc) return;
  // remove is-active here to trigger observer cleanup
  fc.classList.remove('is-active');
});

// expose for debugging
window.briefingFact = { teardown };
