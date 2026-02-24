// jQuery & プラグイン
import $ from 'jquery';
import 'jquery.easing'; // $.easing を拡張するだけで export は不要

//rellaxプラグイン
import Rellax from 'rellax';

//変数
export const breakNum = 768;
export const tabletNum = 1024;

//init
$(window).on('load', function () {
  setLoaded();
  judgeWinSize();
  setInview();
  setSpan();
  mailTo();
  setAcc();
  setTab();
  setHeader();
  setRellax();
  // setTripla();
  // if ($('#g-wrapper').hasClass('home')) {
  //   // setKv();
  //   // setRellax();
  //   // setTimeout(function () {
  //   //   setRellax();
  //   // }, 9000);
  // }
});

//triplaのスタイルを消してみる
// function setTripla() {
//   // 読み込み直後に1回走らせる
//   function disableTriplaCSS() {
//     document.querySelectorAll('style,link[rel="stylesheet"]').forEach((node) => {
//       const txt = node.textContent || '';
//       const href = node.href || '';
//       if (txt.includes('tripla') || href.includes('tripla')) {
//         // 無効化（linkは .disabled / styleは media ハックどちらでも）
//         node.disabled = true; // まずは素直に
//         if (node.tagName === 'STYLE') node.media = 'not-all'; // 確実に殺す
//       }
//     });
//   }

//   // 追加注入にも対応：MutationObserver
//   const mo = new MutationObserver(() => disableTriplaCSS());
//   mo.observe(document.documentElement, { childList: true, subtree: true });

//   // 初期実行
//   disableTriplaCSS();
// }

//
// export function setTest() {
//   alert('aaa');
// }

// //rellax.js
function setRellax() {
  var rellax = new Rellax('.js-rellax');
}

//メアドスパム対策
function mailTo() {
  $('.mailTo').click(function () {
    var address = $(this).attr('href').replace('+', '@');
    location.href = 'mailto:' + address;
    return false;
  });
}

// テキストアニメーション用span生成
function setSpan() {
  $('.txEffect>span').each(function () {
    var text = $.trim(this.textContent),
      html = '';

    text.split('').forEach(function (v) {
      html += '<span>' + v + '</span>';
    });

    this.innerHTML = html;
  });
}

//inview
function setInview() {
  const onceTargets = document.querySelectorAll('.js-inview, .js-inview-fade');
  const toggleTargets = document.querySelectorAll('.js-inview-toggle,.js-inview-fade-toggle');
  const galleryTargets = document.querySelectorAll('.js-inview-gallery');

  if (!('IntersectionObserver' in window)) {
    // フォールバック
    onceTargets.forEach((el) => el.classList.add('is-active'));
    toggleTargets.forEach((el) => el.classList.add('is-active'));
    galleryTargets.forEach((el) => el.classList.add('is-active'));
    return;
  }

  // 一度だけ is-active を付与
  const onceObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          onceObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  onceTargets.forEach((target) => onceObserver.observe(target));

  // ギャラリー用（基本は once と同様、ただし閾値を 0.6 に）
  if (galleryTargets.length) {
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-active');
            galleryObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    galleryTargets.forEach((target) => galleryObserver.observe(target));
  }

  // 出入りでトグル
  const toggleObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    },
    { threshold: 0.1 }
  );
  toggleTargets.forEach((target) => toggleObserver.observe(target));
}

//ドキュメントload判定
function setLoaded() {
  $('#g-wrapper,#g-loading').addClass('loaded');
  loadStart();
  function loadStart() {
    setTimeout(function () {
      $('#g-wrapper,#g-loading').addClass('loadedDelay_01');
    }, 200);
    // setTimeout(function () {
    //   $('#g-wrapper,#loading').addClass('loadedDelay_02');
    // }, 3700);
    setTimeout(function () {
      $('#g-wrapper,#g-loading').addClass('loadedDelay_02');
    }, 1300);
  }
}

// ウィンドウサイズを判別
function judgeWinSize() {
  var winW = $(window).width();
  if (winW > breakNum) {
    $('#g-wrapper').addClass('setPc');
  } else {
    $('#g-wrapper').addClass('setSp');
  }

  var timer = false;
  var currentWidth = window.innerWidth;
  window.addEventListener('resize', function () {
    if (currentWidth == window.innerWidth) {
      return;
    }
    currentWidth = window.innerWidth;
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      winW = $(window).width();
      if (winW > breakNum) {
        $('#g-wrapper').addClass('setPc');
        $('#g-wrapper').removeClass('setSp');
      } else {
        $('#g-wrapper').addClass('setSp');
        $('#g-wrapper').removeClass('setPc');
      }
    }, 200);
  });
}

// ///////ヘッダー制御
let set_position = 0;
function setHeader() {
  var timer = false;
  let scrollingTimer;

  $(window).on('resize', function () {
    if (timer !== false) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      $('header').removeClass('fixedHeader fixedHeaderDelay');
    }, 10);
  });

  fixedHeader();

  $(window).on('scroll', function () {
    fixedHeader();

    // --- PC のみでスクロール中クラス付与 ---
    if (window.matchMedia('(hover: hover)').matches) {
      $('#g-wrapper').addClass('is-scrolling');
      clearTimeout(scrollingTimer);
      scrollingTimer = setTimeout(() => {
        $('#g-wrapper').removeClass('is-scrolling');
      }, 150); // 150ms スクロールが止まったら外す
    }
  });

  function fixedHeader() {
    let h;
    let baseHeight;
    if ($('#g-wrapper').hasClass('home')) {
      h = $('#fv').height();
      baseHeight = h - 50;
    } else {
      baseHeight = 50;
    }

    // 固定ヘッダー処理
    if ($(window).scrollTop() < baseHeight) {
      $('#g-wrapper').removeClass('fixedHeader');
    } else {
      $('#g-wrapper').addClass('fixedHeader');
    }

    // 上下スクロール判定
    if (set_position < $(window).scrollTop()) {
      $('#g-wrapper').addClass('scrollDown').removeClass('scrollUp');
    } else {
      $('#g-wrapper').addClass('scrollUp').removeClass('scrollDown');
    }
    set_position = $(window).scrollTop();

    const winBottom = $(window).scrollTop() + $(window).height();
    const docHeight = $(document).height();

    if (winBottom >= docHeight - 100) {
      $('#g-wrapper').addClass('reachBottom');
    } else {
      $('#g-wrapper').removeClass('reachBottom');
    }
  }
}

//アコーディオン
function setAcc() {
  // // PRODCUTS のアコーディオン
  // $(document).on('click', '#products .js-toggle .js-head', function () {
  //   const $item = $(this).closest('.item');
  //   $item.toggleClass('is-open');
  //   $(this).next().stop().slideToggle('fast');
  // });

  $(document).on('click', '.js-toggle .js-head', function () {
    const $item = $(this).closest('.item');
    $item.toggleClass('is-open');
    $(this).next().stop().slideToggle('fast');
  });
}

//タブ
function setTab() {
  $('.js-tabNav button').on('click', function () {
    $(this).parents('.js-tabNav').find('button').removeClass('is-active');
    $(this).addClass('is-active');
    const target = '#' + $(this).data('target');
    $('.js-tabContent').find('.item').removeClass('is-active');
    $(target).addClass('is-active');
  });
}
