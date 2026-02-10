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
