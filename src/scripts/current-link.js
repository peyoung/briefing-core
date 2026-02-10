// current-link.js
import $ from 'jquery';

$(function () {
  $.yuga.selflink();
});

$.yuga = {
  Uri: function (path) {
    var self = this;
    this.originalPath = path;
    var e = document.createElement('a');
    e.href = path;
    this.absolutePath = e.href;

    var fields = {
      schema: 2,
      username: 5,
      password: 6,
      host: 7,
      path: 9,
      query: 10,
      fragment: 11,
    };
    var r =
      /^((\w+):)?(\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/.exec(
        this.absolutePath
      );
    for (var field in fields) {
      this[field] = r[fields[field]];
    }
    this.querys = {};
    if (this.query) {
      $.each(self.query.split('&'), function () {
        var a = this.split('=');
        if (a.length == 2) self.querys[a[0]] = a[1];
      });
    }
  },
  selflink: function (options) {
    var c = $.extend(
      {
        selfLinkAreaSelector: 'body',
        selfLinkClass: 'current',
        parentsLinkClass: 'parentsLink',
        postfix: '',
        changeImgSelf: true,
        changeImgParents: true,
      },
      options
    );
    $(c.selfLinkAreaSelector + (c.selfLinkAreaSelector ? ' ' : '') + 'a[href]').each(function () {
      var href = new $.yuga.Uri(this.getAttribute('href'));
      var setImgFlg = false;
      if (href.absolutePath.replace('#columnTop', '') == location.href && !href.fragment) {
        $(this).addClass(c.selfLinkClass);
        setImgFlg = c.changeImgSelf;
      } else if (0 <= location.href.search(href.absolutePath)) {
        $(this).addClass(c.parentsLinkClass);
        setImgFlg = c.changeImgParents;
      }
      if (setImgFlg) {
        // 画像差し替え処理を入れる場合はここ
      }
    });
  },
};
