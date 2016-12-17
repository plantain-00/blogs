对于国内的浏览器市场份额，一些统计（例如百度统计 http://tongji.baidu.com/data/browser ）显示，IE7约占4.5%，明显大于IE6，但是操作系统的份额中，Vista确是几乎没有，远比不上XP的30%。

为什么会这样呢？因为国内双核浏览器的IE7核心和chrome核心，而这些统计的原理，是统计请求头中的UserAgent，是浏览器自己声称自己是什么浏览器，如果双核浏览器的用户使用IE7核心，浏览器就会声称自己是IE7浏览器，所以统计的大部分IE7份额实际是双核浏览器内的IE7的份额，并不是真正IE7的份额。

兼容到IE7会有下列麻烦：
1、IE7以下不支持CORS，跨域时，只能使用JSONP来处理，而JSONP是只支持GET请求的，且不能带body，这样不仅开发麻烦，安全性也会减低
2、IE7以下不支持base64形式的图片，小图片不能被内联到js代码中，这样只能选择大量的小图片，或者难以维护的雪碧图

当遇到IE7浏览器时，可以提醒用户切换浏览器核心，或者提醒使用chrome/firefox等现代浏览器。
也可以在网站的meta中，可以向浏览器声明用chrome核心、最新版本的IE来处理。
具体meta是：
```
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="renderer" content="webkit" />
```