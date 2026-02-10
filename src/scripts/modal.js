import $ from 'jquery';
import 'jquery.easing';

$(window).on('load', function () {
  if ($('#g-wrapper').hasClass('setModalPhoto')) {
    setModal_01();
  }
});

let current_scrollY = 0;
let modalButtons = $();
let modalItems = $();
let currentIndex = 0;

function showModalIndex(index) {
  const total = modalItems.length;
  if (total === 0) return;

  index = Math.max(0, Math.min(index, total - 1));
  currentIndex = index;

  // Remove is-active and is-start from all items
  modalItems.removeClass('is-active is-start');

  // Add is-active to current
  const $active = modalItems.eq(currentIndex);
  $active.addClass('is-active');
  // Add is-start after 0.2s
  setTimeout(function () {
    $active.addClass('is-start');
  }, 200);

  // update counter
  $('.modalContainer .currentNum').text(currentIndex + 1);
  $('.modalContainer .totalNum').text(total);

  // handle loading state for the active image
  const $img = $active.find('img').first();
  if ($img.length) {
    if ($img[0].complete && $img[0].naturalWidth) {
      $('#g-wrapper').removeClass('is-loading');
    } else {
      $('#g-wrapper').addClass('is-loading');
      $img.on('load error', function () {
        $('#g-wrapper').removeClass('is-loading');
      });
    }
  } else {
    $('#g-wrapper').removeClass('is-loading');
  }
}

//
function setModal_01() {
  modalButtons = $('.js-modalBtn');
  modalItems = $('.modalContainer .item');

  // --- Swipe/drag navigation ---
  let startX = 0;
  let isTouch = false;
  const $slider = $('.modalSlider');

  // Touch (mobile/tablet)
  $slider.on('touchstart', function (e) {
    if (!e.originalEvent.touches) return;
    isTouch = true;
    startX = e.originalEvent.touches[0].clientX;
  });
  $slider.on('touchend', function (e) {
    if (!isTouch) return;
    const endX = e.originalEvent.changedTouches[0].clientX;
    const diff = endX - startX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // swipe left → next
        const total = modalItems.length;
        const next = (currentIndex + 1) % total;
        showModalIndex(next);
      } else {
        // swipe right → prev
        const total = modalItems.length;
        const prev = (currentIndex - 1 + total) % total;
        showModalIndex(prev);
      }
    }
    isTouch = false;
  });

  // Mouse drag (PC)
  let dragStartX = 0;
  let dragging = false;
  $slider.on('mousedown', function (e) {
    if (window.matchMedia('(pointer: coarse)').matches) return; // ignore on touch
    dragging = true;
    dragStartX = e.clientX;
    e.preventDefault();
  });
  $(document).on('mousemove', function (e) {
    if (!dragging) return;
    // (optional: show drag feedback here)
  });
  $(document).on('mouseup', function (e) {
    if (!dragging) return;
    const dragEndX = e.clientX;
    const diff = dragEndX - dragStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // drag left → next
        const total = modalItems.length;
        const next = (currentIndex + 1) % total;
        showModalIndex(next);
      } else {
        // drag right → prev
        const total = modalItems.length;
        const prev = (currentIndex - 1 + total) % total;
        showModalIndex(prev);
      }
    }
    dragging = false;
  });

  $('.js-modalBtn').on('click', function (e) {
    e.preventDefault();
    const $btn = $(this);
    // Prefer explicit data-index from the thumbnail; fallback to index
    const idxAttr = $btn.attr('data-index');
    const idx = typeof idxAttr !== 'undefined' ? parseInt(idxAttr, 10) : NaN;
    if (!Number.isNaN(idx)) {
      currentIndex = idx;
    } else {
      currentIndex = modalButtons.index($btn);
    }
    showModalIndex(currentIndex);
    openModal();
  });

  // Prev: show previous image (wrap to last if at start)
  $('.modalContainer .btnPrev').on('click', function (e) {
    e && e.preventDefault();
    const total = modalItems.length;
    if (total === 0) return;
    const prev = (currentIndex - 1 + total) % total;
    showModalIndex(prev);
  });

  // Next: show next image (wrap to first if at end)
  $('.modalContainer .btnNext').on('click', function (e) {
    e && e.preventDefault();
    const total = modalItems.length;
    if (total === 0) return;
    const next = (currentIndex + 1) % total;
    showModalIndex(next);
  });

  $('.js-modalClose').on('click', function (event) {
    closeModal();
  });
}

//共通
function openModal() {
  current_scrollY = $(window).scrollTop();
  $('#g-wrapper').addClass('modalOpen');
  setTimeout(function () {
    $('#g-wrapper').addClass('modalReady');
  }, 100);
}

function closeModal() {
  $('#g-wrapper').removeClass('modalReady');
  // Ensure loading state is cleared when modal closes
  $('#g-wrapper').removeClass('is-loading');
  setTimeout(function () {
    $('#g-wrapper').removeClass('modalOpen');
  }, 200);
}
