import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.min.css';

import ResizeObserver from 'resize-observer-polyfill';
window.ResizeObserver = ResizeObserver;
// Initialize SimpleBar on elements with class `.scrollable` after the page has loaded
window.addEventListener('load', function () {
  try {
    document.querySelectorAll('.g-scrollable').forEach(function (el) {
      // don't initialize if already initialized
      if (el.querySelector('.simplebar-scroll-content')) return;
      new SimpleBar(el);
    });
  } catch (e) {
    // fail silently in case SimpleBar isn't available in some environments
    // console.warn('SimpleBar init failed:', e);
  }
});
