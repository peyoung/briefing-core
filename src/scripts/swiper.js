import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

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
  swiper01 = new Swiper('.swiper_01', {
    // modules: [Navigation],
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
}

// 複数ある `.js-setFactModal` のいずれかがクリックされたら `setSlider_01` を起動
document.addEventListener('click', (e) => {
  const trigger = e.target instanceof Element ? e.target.closest('.js-setFactModal') : null;
  if (!trigger) return;
  if (!swiper01) {
    setSlider_01();
  }
});
