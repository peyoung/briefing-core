// スムーススクロール
// headerの高さを取得し、headeHeightに代入
// const headerHeight = document.querySelector('header .col-logo').offsetHeight;
const headerHeight = 0;

//querySelectorAllメソッドを使用してページ内のhref属性が#で始まるものを選択
//forEachメソッドを使って、各アンカータグにクリックされた時の処理
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    // クリックされたときのデフォルトの挙動を防ぐ
    e.preventDefault();

    // クリックされたアンカータグのhref属性を取得
    const href = anchor.getAttribute('href');

    // href属性の#を取り除いた部分と一致するIDを取得
    const target = document.getElementById(href.replace('#', ''));

    //取得した要素の位置を取得するために、getBoundingClientRect()を呼び出し、ページ上の位置を計算。
    //headerの高さを引いて、スクロール位置がヘッダーの下になるように調整します。
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    // window.scrollTo()を呼び出して、スクロール位置を設定します。behaviorオプションをsmoothに設定することで、スムーズなスクロールを実現します。
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  });
});

// ページ外スクロール
// ページが読み込まれたら処理を実行
window.addEventListener('DOMContentLoaded', function () {
  // URLオブジェクトを使用して、現在のURLを解析し、ハッシュ値を取得
  const url = new URL(location.href);

  // slice()メソッドを使って、ハッシュ値の先頭の#を除去
  const hash = url.hash.slice(1);

  //取得したハッシュ値をIDとして持つ要素を取得
  const target = document.getElementById(hash);

  //targetに対応する要素が存在する場合、以下の処理を実行
  if (target) {
    //getBoundingClientRect()を呼び出して、スクロール先の要素の位置を取得。また、headerの高さを引いて、スクロール位置がヘッダーの下になるように調整
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    //setTimeout()を使って、スクロール位置を初期化
    setTimeout(function () {
      window.scrollTo({ top: 0 }, 0);
    });

    //setTimeout()を使って、スクロール位置を設定します。この処理は、先程と同じ方法でスクロール位置を計算し、window.scrollTo()メソッドを呼び出して、スムーズなスクロールを実現
    setTimeout(function () {
      if (window.lenis) {
        window.lenis.scrollTo(top, {
          offset: -headerHeight,
          immediate: true,
        });
      } else {
        window.scrollTo({
          top: top,
          behavior: 'smooth',
        });
      }
    }, 1000);
  }
});
