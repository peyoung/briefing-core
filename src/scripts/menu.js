// jQuery & プラグイン
import $ from 'jquery';
import 'jquery.easing'; // $.easing を拡張するだけで export は不要

$(window).on('load', function () {
  setMainMenu();
});

// リサイズ時にメニューを閉じる
$(window).on('resize', function () {
  closeFnc();
});

let current_scrollY = 0;

// //////////////////////////メインメニュー
function setMainMenu() {
  $('#menuBtn').on('click', function () {
    if (!$('#menuBtn').hasClass('is-active')) {
      openFnc();
    } else {
      closeFnc();
    }
  });
  $('.menuOpen #clickBlocker,.menuCloseArea,.menuCloseBtn,.js-menu-close').on(
    'click',
    function (event) {
      event.stopPropagation();
      closeFnc();
    }
  );

  $('#menuPanel a').on('click', function () {
    // カーテンアニメーション(0.6s)が終わるまで待ってからメニューを閉じる
    setTimeout(() => {
      closeFnc();
    }, 800);
  });
}

function openFnc() {
  window.lenis?.stop();
  const video = document.querySelector('#kvVideo');
  if (video) video.play();
  current_scrollY = $(window).scrollTop();
  $('#menuBtn').addClass('is-active');
  $('#g-wrapper').addClass('menuOpen');
  setTimeout(function () {
    $('#g-wrapper').addClass('menuStart');
  }, 100);
  setTimeout(function () {
    $('#g-wrapper').addClass('menuOpenAfter');
  }, 400);
  // $('#menuPanel').animate(
  //   {
  //     scrollTop: 0,
  //   },
  //   600
  // );
}

function closeFnc() {
  window.lenis?.start();
  if ($('#menuBtn').hasClass('is-active')) {
    const video = document.querySelector('#kvVideo');
    if (video) video.pause();
  }
  $('#menuBtn').removeClass('is-active');
  $('#g-wrapper').removeClass('menuStart menuOpenAfter');
  setTimeout(function () {
    $('#g-wrapper').removeClass('menuOpen');
  }, 200);
  // $('html, body').prop({
  //   scrollTop: current_scrollY,
  // });
}
