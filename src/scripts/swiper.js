import Swiper from 'swiper/bundle';
import 'swiper/css/bundle';

// 外から参照できるようにグローバル変数化
export let swiper01 = null;

document.addEventListener('DOMContentLoaded', () => {
  setSlider_01();
});

//
function setSlider_01() {
  swiper01 = new Swiper('.swiper_01 .swiper-main', {
    // modules: [Navigation],
    // initialSlide: 1,
    // centeredSlides: true,
    slidesPerView: 1.3,
    // slidesPerView: 'auto',
    spaceBetween: 20,
    threshold: 10,
    loop: true,
    mousewheel: {
      forceToAxis: true,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    speed: 1000, // スライドアニメーションのスピード（ミリ秒）
    // autoplay: {
    //   // 自動再生
    //   delay: 6000,
    //   disableOnInteraction: false, // 矢印をクリックしても自動再生を止めない
    //   waitForTransition: false, // アニメーションの間も自動再生を止めない（最初のスライドの表示時間を揃えたいときに）
    // },
    breakpoints: {
      769: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}
