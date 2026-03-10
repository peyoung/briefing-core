import Swiper, { Mousewheel } from 'swiper';
import 'swiper/css';
import 'swiper/css/mousewheel';

//rellaxプラグイン

// 外から参照できるようにグローバル変数化
export let swiper01 = null;

// document.addEventListener('DOMContentLoaded', () => {
//   if (document.querySelector('#g-wrapper.home')) {
//     setSlider_01();
//   }
// });

//
function setSlider_01() {
  const target = document.querySelector('.swiper_01');
  if (!(target instanceof Element)) return null;
  if (swiper01 && !swiper01.destroyed) return swiper01;

  swiper01 = new Swiper('.swiper_01', {
    modules: [Mousewheel],
    // initialSlide: 2,
    centeredSlides: true,
    slidesPerView: 1,
    // slidesPerView: 'auto',
    spaceBetween: 0,
    threshold: 10,
    // loop: true,
    mousewheel: {
      forceToAxis: true,
    },
    speed: 1000, // スライドアニメーションのスピード（ミリ秒）
    // breakpoints: {
    //   769: {
    //     slidesPerView: 1,
    //   },
    // },
  });

  return swiper01;
}

// 複数ある `.js-setFactModal` のいずれかがクリックされたら `setSlider_01` を起動
document.addEventListener('click', (e) => {
  const trigger = e.target instanceof Element ? e.target.closest('.js-setFactModal') : null;
  if (!trigger) return;
  setSlider_01();
});
