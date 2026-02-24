// Lenis
import Lenis from 'lenis';
// GSAP
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

// window.addEventListener('load', () => {
//   setGsapVideo();
// });

// Lenis 初期化（あなたの既存設定を流用）
const lenis = new Lenis({
  duration: 0.5,
  easing: (t) => 1 - Math.pow(1 - t, 3), // easeOutCubic
  smoothWheel: true,
  smoothTouch: false,
});

// Lenis をグローバルに公開
window.lenis = lenis;

// Lenis のスクロールで ScrollTrigger を更新
lenis.on('scroll', ScrollTrigger.update);

// GSAP の ticker に Lenis を乗せる（GSAPは秒、Lenisはmsなので×1000）
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

//
// function setGsapVideo() {
//   const triggers = document.querySelectorAll('.js-inview-movie');

//   triggers.forEach((el) => {
//     ScrollTrigger.create({
//       trigger: el, // トリガーとなる要素
//       start: 'top 80%', // ビューポートの80%に到達したら発火
//       onEnter: () => {
//         const video = el.querySelector('video');
//         if (video) video.play();
//       },
//     });
//   });
// }

window.addEventListener('load', () => {
  // restore GSAP-based toggleClass behavior
  setToggleClass();
});

function setToggleClass() {
  const triggers = document.querySelectorAll('.js-toggleClass');
  // store created toggle ScrollTriggers so other code can disable/enable them
  window.__toggleTriggers = window.__toggleTriggers || [];
  // clear previous references
  window.__toggleTriggers.length = 0;
  triggers.forEach((el, index) => {
    // 最初の要素だけstart位置を調整して、ロード時に確実に反応するようにする
    const startPos = index === 0 ? 'top bottom' : 'top top';

    const st = ScrollTrigger.create({
      trigger: el,
      start: startPos,
      end: 'bottom top-=20%',
      toggleClass: 'is-current',
      onToggle: (self) => {
        if (self.isActive && el.classList.contains('is-current')) {
          const id = el.id;
          const currentTx = document.getElementById('currentTx');
          if (!currentTx) return;
          switch (id) {
            case 'value':
              currentTx.textContent = 'VALUE';
              break;
            case 'fact':
              currentTx.textContent = 'FACT';
              break;
            case 'redLine':
              currentTx.textContent = 'USA-REDLINE';
              break;
            case 'tagLine':
              currentTx.textContent = 'TAGLINE';
              break;
            case 'brandCore':
              currentTx.textContent = 'TOP';
              break;
            case 'bottomView':
            case 'purpose': {
              const wrapper = document.getElementById('g-wrapper');
              if (wrapper) wrapper.classList.add('is-bottomView');
              break;
            }
            // それ以外は状態変化させない
          }
          // #bottomView, #purpose以外の時はis-bottomVIewを外す
          if (id !== 'bottomView' && id !== 'purpose') {
            const wrapper = document.getElementById('g-wrapper');
            if (wrapper) wrapper.classList.remove('is-bottomView');
          }
        }
      },
    });
    window.__toggleTriggers.push(st);
  });
}

// Note: IntersectionObserver-based toggle moved to main.js

// #firstView の bottom が top に到達したタイミングで header に is-active を付与/解除
function setHeaderActiveOnFirstView() {
  const header = document.querySelector('header');
  const first = document.querySelector('#firstView');
  if (!header || !first) return;

  ScrollTrigger.create({
    trigger: '#firstView',
    start: 'bottom top',
    onEnter: () => header.classList.add('is-active'),
    onLeaveBack: () => header.classList.remove('is-active'),
  });
}

// 初期化にヘッダー制御を追加
// 初期化にヘッダー制御とシーントリガーを追加
window.addEventListener('load', () => {
  setHeaderActiveOnFirstView();
  setSceneClasses();
});

// (モーダルハンドラは各コンポーネント側で実装します)

// シーンスタイル用の ScrollTrigger をまとめて作成
function setSceneClasses() {
  // style_02 から style_05 までを準備
  for (let i = 2; i <= 5; i++) {
    const styleNum = String(i).padStart(2, '0');
    const selector = `.scene.style_${styleNum}`;

    const elems = document.querySelectorAll(selector);
    elems.forEach((el) => {
      const parent = el.closest('.mainSection');
      if (!parent) return;

      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        onEnter: () => parent.classList.add(`is-scene_${styleNum}`),
        onEnterBack: () => parent.classList.add(`is-scene_${styleNum}`),
        onLeave: () => {
          if (!el.classList.contains('stay')) {
            parent.classList.remove(`is-scene_${styleNum}`);
          }
        },
        onLeaveBack: () => {
          parent.classList.remove(`is-scene_${styleNum}`);
        },
      });
    });
  }
}
