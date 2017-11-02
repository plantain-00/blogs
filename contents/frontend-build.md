# 前端构建过程实践总结

把所有东西都写在 html 文件中应该是最原始的前端了：

```c
index.html
```

### html/css/js 分离

分离后的目录结构如下：

```c
index.html
// changes start
scripts
    index.js
styles
    index.css
// changes end
```

其中 html 文件里类似于：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link href="styles/index.css" rel="stylesheet">
  </head>
  <body>
    <script src="scripts/index.js"></script>
  </body>
</html>
```

### 如果要引入第三方文件

可以通过 bower/npm 安装到本地，或直接使用 CDN 地址。

以主流的 npm 方式为例，如果引入 bootstrap，html 文件变成：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <!--changes start-->
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap-theme.min.css" rel="stylesheet">
    <!--changes end-->
    <link href="styles/index.css" rel="stylesheet">
  </head>
  <body>
    <!--changes start-->
    <script src="./node_modules/jquery/2.2.0/jquery.min.js"></script>
    <script src="./node_modules/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <!--changes end-->
    <script src="scripts/index.js"></script>
  </body>
</html>
```

在这个阶段，一般需要自定义一个 npm 命令来把 node_modules 中的文件复制出来。

### 如果要给 css 和 js 加上版本

除了可以借助后端之外，前端可用的方案有 grunt-rev、gulp-rev、webpack 的 long term caching。

webpack 的方案目前只能给 js 文件加上版本，如果 css 不想被打包进去，还要找其它的方案来处理 css。

这里以 rev-static 为例，在 js/css 文件名上加版本，并修改 html 文件中对应的文件名。

下面是 `rev-static.config.js` 文件：

```js
module.exports = {
    inputFiles: [
        "styles/index.css",
        "scripts/index.js",
        "index.ejs.html"
    ],
    outputFiles: [
        "index.html"
    ],
    json: false,
    ejsOptions: {
        rmWhitespace: false
    },
    sha: 256,
    customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + "-" + md5String + extensionName,
}
```

这里需要把 `index.html` 文件的文件名修改为 `index.ejs.html`：

```c
// changes start
index.ejs.html
// changes end
scripts
    index.js
styles
    index.css
```

内容修改为：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap-theme.min.css" rel="stylesheet">
    <!--changes start-->
    <link href="styles/<%=stylesIndexCss%>" rel="stylesheet">
    <!--changes end-->
  </head>
  <body>
    <script src="./node_modules/jquery/2.2.0/jquery.min.js"></script>
    <script src="./node_modules/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <!--changes start-->
    <script src="scripts/<%=scriptsIndexJs%>"></script>
    <!--changes end-->
  </body>
</html>
```

执行 `rev-static` 后的目录结构如下：

```c
// changes start
index.html
// changes end
scripts
    index.js
    // changes start
    index-caa02e8ba0c5af68e9ac7728da2bed75.js
    // changes end
styles
    index.css
    // changes start
    index-f695dca31d31e7c85e3442e5ca88da6d.css
    // changes end
```

其中 `index.html` 的内容为：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">
    <link href="./node_modules/bootstrap/3.3.6/css/bootstrap-theme.min.css" rel="stylesheet">
    <!--changes start-->
    <link href="styles/index-f695dca31d31e7c85e3442e5ca88da6d.css" rel="stylesheet">
    <!--changes end-->
  </head>
  <body>
    <script src="./node_modules/jquery/2.2.0/jquery.min.js"></script>
    <script src="./node_modules/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    <!--changes start-->
    <script src="scripts/index-caa02e8ba0c5af68e9ac7728da2bed75.js"></script>
    <!--changes end-->
  </body>
</html>
```

这样版本化就完成了。

### 如果 js 变得复杂，需要模块化

常见的前端 js 模块化方式有 commonjs 和 AMD，相应的工具是 webpack/browserify 和 require.js/webpack。

采用哪种方式往往会受到采用的前端框架影响。例如对于 react 和相关的工具链，官方推荐 commonjs，vuejs 也是官方推荐 commonjs，而对于 angular2，官方推荐 system.js，当然也可以不用推荐的方式。

下面以用 webpack 打包 commonjs 模块为例，部分目录结构如下：

```c
scripts
    index.js
    // changes start
    a.js
    b.js
    // changes end
```

下面是 webpack 的配置文件，`webpack.config.js` 文件：

```javascript
const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        index: "scripts/index"
    },
    output: {
        path: path.join(__dirname, "scripts"),
        filename: "[name].bundle.js"
    }
};
```

运行 `webpack` 后，生成 `scripts/index.bundle.js`，目录结构如下：

```c
scripts
    index.js
    a.js
    b.js
    // changes start
    index.bundle.js
    // changes end
```

这时 `index.bundle.js` 取代 `index.js`，成为 js 的入口文件，`index.ejs.html`、`rev-static.config.js` 中都有做相应的更新。

### 使用 lint 控制代码格式

以 ESlint 和 css lint 为例，直接执行相应的 CLI 命令即可。

npm 脚本变成：

```js
{
    "build": "npm run lint && webpack && rev-static",
    "lint": "eslint scripts/*.js && csslint styles/*.css"
}
```

执行 `npm run build` 即可把这几个构建过程串联起来。

### css、js、html 的压缩

js 可以用 webpack 的插件来压缩，css 可以用 cleancss 来压缩，html 可以用 rev-static 来压缩：

下面是 `rev-static.config.js` 文件：

```js
module.exports = {
    inputFiles: [
        "styles/index.bundle.css",
        "scripts/index.bundle.js",
        "index.ejs.html"
    ],
    outputFiles: [
        "index.html"
    ],
    json: false,
    ejsOptions: {
        // changes start
        "rmWhitespace": true
        // changes end
    },
    sha: 256,
    customNewFileName: (filePath, fileString, md5String, baseName, extensionName) => baseName + "-" + md5String + extensionName,
}
```

下面是 webpack 的配置文件，`webpack.config.js` 文件：

```javascript
const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        index: "scripts/index"
    },
    output: {
        path: path.join(__dirname, "scripts"),
        filename: "[name].bundle.js"
    },
    // changes start
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        })
    ]
    // changes end
};
```

npm 脚本变成：

```js
{
    // changes start
    "build": "npm run lint && webpack && npm run cleancss && rev-static",
    // changes end
    "lint": "eslint scripts/*.js && csslint styles/*.css",
    // changes start
    "cleancss": "cleancss styles/index.css -o styles/index.bundle.css"
    // changes end
}
```

这时 `index.bundle.css` 取代 `index.css`，成为 css 的入口文件，`index.ejs.html`、`rev-static.config.js` 中都要做相应的更新。

### 如果使用 LESS 或 SCSS，并编译成 css

以 SCSS 为例，可以执行 shell 命令：`sass styles/index.scss > build/index.css`，scss-lint 也可以以命令的形式执行 `scss-lint styles/*.scss`：

npm 脚本变成：

```js
{
    "build": "npm run lint && webpack && npm run cleancss && rev-static",
    // changes start
    "lint": "eslint scripts/*.js && scss-lint styles/*.css",
    "cleancss": "sass styles/index.scss > styles/index.css && cleancss styles/index.css -o styles/index.bundle.css"
    // changes end
}
```

### 如果使用 css 后处理器工具

如果支持最新的 2 个浏览器版本：

配置文件 `postcss.json` 是：

```
{
    "autoprefixer": {
        "browsers": ["last 2 versions"]
    }
}
```

npm 脚本变成：

```js
{
    "build": "npm run lint && webpack && npm run cleancss && rev-static",
    "lint": "eslint scripts/*.js && scss-lint styles/*.css",
    // changes start
    "cleancss": "sass styles/index.scss > styles/index.css && postcss --use autoprefixer -c postcss.json -o styles/index.css styles/index.css && cleancss styles/index.css -o styles/index.bundle.css"
    // changes end
}
```

### 如果写 ES6 代码，并编译成 ES5

这里以 babel 为例：

配置文件是：

```
{
    presets: ["es2015"]
}
```

npm 脚本变成：

```js
{
    // changes start
    "build": "babel && npm run lint && webpack && npm run cleancss && rev-static",
    // changes end
    "lint": "eslint scripts/*.js && scss-lint styles/*.css",
    "cleancss": "sass styles/index.scss > styles/index.css && postcss --use autoprefixer -c postcss.json -o styles/index.css styles/index.css && cleancss styles/index.css -o styles/index.bundle.css"
}
```

### 如果使用 typescript 或 coffeescript，并编译成 ES5

这里以 typescript 为例：

配置文件为：

```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "es5"
    }
}
```

npm 脚本变成：

```js
{
    // changes start
    "build": "tsc && npm run lint && webpack && npm run cleancss && rev-static",
    // changes end
    "lint": "eslint scripts/*.js && scss-lint styles/*.css",
    "cleancss": "sass styles/index.scss > styles/index.css && postcss --use autoprefixer -c postcss.json -o styles/index.css styles/index.css && cleancss styles/index.css -o styles/index.bundle.css"
}
```

### 第三方大文件独立打包

以 react 和 react-router 为例，它们都要通过 npm 安装，默认会被打包进去。

需要把它们打包到 vendor 中，这样当程序变化时，vendor 的变化频率不会很大。

```c
scripts
    index.js
    a.js
    b.js
    index.bundle.js
    // changes start
    vendor.js
    // changes end
```

其中 `vendor.js`：

```
import "react";
import "react-router";
```

下面是 webpack 的配置文件，`webpack.config.js` 文件：

```javascript
const webpack = require("webpack");
const path = require("path");

module.exports = {
    entry: {
        index: "scripts/index",
        // changes start
        vendor: "scripts/vendor"
        // changes end
    },
    output: {
        path: path.join(__dirname, "scripts"),
        filename: "[name].bundle.js"
    },
    plugins: [
        // changes start
        new webpack.optimize.DedupePlugin(),
        // changes end
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
        }),
        // changes start
        new webpack.optimize.CommonsChunkPlugin({
            name: ["index", "vendor"]
        })
        // changes end
    ]
};
```

对于 CSS，cleancss 可以用于合并第三方包：

npm 脚本变成：

```js
{
    "build": "babel && npm run lint && webpack && npm run cleancss && rev-static",
    "lint": "eslint scripts/*.js && scss-lint styles/*.css",
    // changes start
    "cleancss": "sass styles/index.scss > styles/index.css && postcss --use autoprefixer -c postcss.json -o styles/index.css styles/index.css && cleancss styles/index.css -o styles/index.bundle.css && cleancss node_modules/bootstrap/dist/css/bootstrap.min.css node_modules/bootstrap/dist/css/bootstrap-theme.min.css > styles/vendor.css"
    // changes end
}
```

另外对于 bootstrap，还需要复制一下字体文件，到发布目录，并保持 css 和字体文件的相对位置一致。

### 从 js 文件中抽出模板

js 文件中经常会有模版（例如在 vuejs 和 angular 中），模板直接写在 js 中，一般没有语法高亮，容易出错。为了避免这个问题，可以把模板字符串抽取到独立的 html 模板文件中，再利用代码打包工具（例如 webpack 的 raw-loader）在打包时加载模板。

```ts
@Component({
   template: require("raw-loader!./foo.html"),
})
class Bar extends Vue { }
```

模板文件分离后，可以利用 `html-minifier` 等消除模板中无效的换行和空格，以减少模板的大小：

```bash
html-minifier --collapse-whitespace --case-sensitive --collapse-inline-tag-whitespace foo.template.html -o foo.html
```

在制作组件库时，不希望依赖 `raw-loader` 这样的模板加载工具（因为使用方不一定使用 webpack 来打包），可以利用 `file2variable-cli` 来把模板文件转换为 ES6 文件：

```bash
file2variable-cli foo.html -o foo-variables.js
```

执行后，生成类似如下的 js 文件：

```js
export const fooHtml = `<span>{{foo}}</span>`;
```

模板的使用过程也就变为：

```ts
import { fooHtml } from "./foo-variables";

@Component({
   template: fooHtml,
})
class Bar extends Vue { }
```

### 打包时，把小图标转为 base64 格式，并内联到 css 文件中

这样做的话，可以在加载时减少 http 请求数。而具体的方法，可以使用 `image2base64-cli` 来实现：

```bash
image2base64-cli images/*.png --less variables.less
```

生成的 less 文件类似于：

```less
@foo-png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEUAAAAAAAAAAAAAAAAAAAADAwMEBAQAAADHx8e1tbUAAAD////p6enz8/P39/f7+/vu7u5nZ34DAAAAC3RSTlMAMTwMGE8rBqWkYZ+r9QEAAACPSURBVDjL7ZJbDoMgEADdF2oXhfuftksogcA2PUCdL5cZQwhsf8bOATqB9zngQ0cOnoOg0n5HRNEwB6Dw+SJURAUvaF5V3KD5rwExVe9vUVaRqyfwAjH1qn7zg5RuI5l3g4R4FcyXaQ1uIMw5I9VpDS6wI0TzdVqDbEt20D5NhCjQkbjcBZ9x5OTf7+Fh5A1DkAXNMEdnOQAAAABJRU5ErkJggg==';
@bar-png: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAIVBMVEUAAAAAAAAAAAAAAAAAAAABAQH////7+/v39/fy8vLr6+sN7QgRAAAABnRSTlMADD0xGCVFoQlVAAAAQklEQVQoz2MYakBEAE0gTBFNwCxJAE2gTBFNIA2qBCGQpogukIIiYF5ejqrCoqMJ1QzLmWi2WC1Cc0eUIqZfBjsAAO4ACr4wbS2OAAAAAElFTkSuQmCC';
```

在使用时，就可以使用这些变量了：

```less
@import "./variables.less";

.foo {
  background-image: url("@{foo-png}");
}
.bar {
  background-image: url("@{bar-png}");
}
```

### 动态导入（dynamic import）

打包时，静态导入（`import * as foo from "foo";`）和 commonjs（`const foo = require("foo");`）的模块会被直接打包。

某些情况，静态导入不能满足需求，需要动态倒入（`import("foo").then(foo=>{//todo})`)。

例如：多语言、UI 皮肤和主题、插件、非首屏页面才需要的大体积模块。

```ts
import * as foo from "foo";
// do something with module `foo`

setTimeout(()=>{
    // some time later, dynamic import module "bar"
    import("bar").then(bar=>{
        // do something with module `bar`
    });
},1000);
```

目前 webpack 支持 “动态导入” 代码的打包，它会生成多份包文件，运行 `webpack` 后，生成 `scripts/index.bundle.js`，目录结构如下：

```c
scripts
    index.js
    a.js
    b.js
    // changes start
    0.index.bundle.js
    // changes end
    index.bundle.js
```

其中，以数字开始的包，会在动态导入时被动态加载。

对于 typescript，需要把 `module` 设为 `ESNext`，以在生成 js 文件时，保留 `import` 语法。

### prerender

解决 SEO 问题和加快首屏速度的一个方式是利用 prerender

首先可以观察到：

+ vuejs 的 el 元素在 js 执行前是可见的，js 执行后，整个 el 元素都会被生成的 html 替换掉
+ reactjs 和 angular 的容器元素在 js 执行前是可见的，js 执行后，生成的 html 代码会作为 innerHTML 替换掉原来的 innerHTML

利用这个特性，可以 prerender 的 html 片段插入到 el 元素或容器元素中，使得在 js 执行前就存在首屏的 html 代码

对于具体的 build 脚本：

https://github.com/plantain-00/prerender-js 可以 prerender 页面，根据元素 ID 获取生成的 html 并保存到本地文件中

`http-server -p 8000`

```ts
import * as puppeteer from "puppeteer";
import * as fs from "fs";

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.emulate({ viewport: { width: 1440, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36" });
await page.waitFor(1000);
await page.goto("http://localhost:8000");
await page.waitFor(2000);
const content = await page.evaluate(() => {
    const element = document.querySelector("#prerender-container");
    return element ? element.innerHTML.trim() : "";
});
fs.writeFileSync("prerender/index.html", content);

browser.close();
```

在 `rev-static.config.js` 中读取保存的 html 代码片段，并配置到 `context` 中

```ts
const fs = require('fs')
...
  context: {
    prerender: fs.readFileSync('prerender/index.html')
  }
...
```

在 `index.ejs.html` 模版内，嵌入该代码片段

```html
<div id="prerender-container">
    <div id="container"><%-context.prerender %></div>
</div>
```

### precache

使用 precache 可以离线运行程序，例如计算器。一般通过 service worker 来实现

```js
// sw-precache.config.js
module.exports = {
  staticFileGlobs: [
    'index.html',
    'index.bundle-*.js',
    'vendor.bundle-*.js',
    'index.bundle-*.css',
    'vendor.bundle-*.css'
  ]
}
```

`sw-precache --config sw-precache.config.js`

`uglifyjs service-worker.js -o service-worker.bundle.js`

```js
if (navigator.serviceWorker) {
    navigator.serviceWorker.register("service-worker.bundle.js").catch(error => {
        console.log("registration failed with error: " + error);
    });
}
```
