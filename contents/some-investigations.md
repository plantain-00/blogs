# 一些技术的调查记录

## Push API 和 web-push 库

在 service worker 上监听`push`事件、通过`self.registration.showNotification()`来向用户 push 消息

服务端可以使用 web-push 库来发送消息

## IndexedDB API 或 localForage 库

可以存储数据

## Vibration API

可以控制振动设备

```js
navigator.vibrate(1000)
```

## Screen Orientation API

可以获取屏幕方向和监视屏幕方向变化

```js
screen.orientation.onchange = function () {
    console.log(screen.orientation.type + " " + screen.orientation.angle);
}
console.log(screen.orientation.type + " " + screen.orientation.angle);
```

## Device Orientation API 或 gyronorm 库

可以通过加速度计和陀螺仪设备数据

## Pointer Lock API

可以把鼠标输入控制在某个页面元素上，避免游戏、操作地图等时因为误触到外面导致程序失去焦点

## Geolocation API

可以获取地理位置信息、监视地理位置信息变化

## Ambient Light Sensor API

可以监视光传感器的光强变化事件

```js
window.addEventListener('devicelight', function (event) {
    console.log(event.value);
});
```

## NetworkInformation API

可以查看当前连接状态、监视连接状态变化事件，状态包括网络类型（蓝牙、wifi 等）、带宽、往返时间

```js
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
connection.addEventListener('typechange', () => {
    console.log(connection);
});
```

## SharedWorker

可以创建被多个页面共享的 worker，和普通 worker 一样，SharedWorker 可以通过 MessagePort API 通信

```js
var sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.onmessage = e => {
    console.log(e.data);
};
sharedWorker.port.start();
```

可以和 PostMessage API 一样完成页面间的通信；另外对于比较 heavy 的资源，例如 WebSocket 连接，可以在 SharedWorker 中只创建一个连接，然后就可以去掉各个页面内的 WebSocket 连接了

## AssemblyScript

js 转 WebAssembly 的尝试，用 Typescript 的类型系统来表示具体的类型，例如 int32 等

目前还不够完整，WebAssembly 标准目前也还未稳定，WebAssembly 的浏览器支持目前需要开启 flag 才能使用

## nginScript

nginx 的 js 配置语言，没有默认启用

外部 js 文件需要是一个 function，在配置中的 http 块中，通过`js_include` 和 `js_set` 导入 function 到变量中，例如：

```nginx
js_include a.js;
js_set $foo foo;
```

目前只支持简单的运算，使用场景有限

再使用该变量，例如：

```nginx
location / {
    default_type text/html;
    return 200 $result;
}
```

## openresty

基于 nginx 和 lua 的高性能服务器

缺点是，lua 脚本小众，语言能力弱，例如难以区分 table 是 object 还是 array

## stencil.js

jsx 到 web component 的转换库，还未稳定

## js 配置文件用 ts 来写

使用前 build 成 js 文件，或直接使用 `ts-node` 来执行

优点：可以避免类型错误

缺点：增加额外复杂度，也引入了额外的依赖

权衡：一般的配置文件的逻辑并不复杂，用 js 来写；负责引入 ts

## source-map

优点：方便在浏览器中调试

缺点：为 build 过程增加一个维度的复杂度；会暴露源码；

其它方式：默认 uglify，调试时使用 debug 版本，也就是只压缩 vendor 和 framework，不压缩源码的 build 结果，通过环境变量，或把不压缩的文件临时添加到 `webpack.config.js` 内的 `uglify plugin` 配置的 `exclude` 数组中的方式。

## image-compressor

图片上传前压缩

## preload，prefetch 和 http/2 server push

prefetch 可以低优先级加载资源

preload 高优先级加载资源，但又不被马上执行

从浏览器端的程序角度，http/2 server push 的结果和待 preload tag 的结果一致

如果要某些资源通过 http/2 server push 获得，浏览器端需要在请求头上加上 Link header，头内容是所有待 push 的资源文件

服务端通过 response 确定浏览器支持 http/2 server push 后，通过 header 中的 Link header，确定要 push 哪些资源文件，再 push 这些资源文件

## envify

可以根据环境变量，不打包一些代码，从而减少包体积，例如，debug 版本包中包含了大量的错误提示文字，提高开发体验，production 版本包中去除这些文字

不使用 envify 的话，可以用多入口打包的方式来实现，debug 包覆盖默认的实现

## rollup

支持 es6 module 和 tree shake 的打包工具；后来 webpack2 也支持这些了

适合为前端库打包成 UMD 文件

## pell.js

轻量级的富文本编辑器；目前还未稳定

## gpu.js

利用 gpu 加速计算的库；目前还未稳定

## css in js 和 css module

目前还不成熟，缺乏统一的标准，也没有广泛采用的方案

## html-webpack-plugin

用于为 webpack 打包的 js 文件生成 html 文件

生成的 html 难以自定义，例外，它会把所有产生的 js 文件都引入进去，对于多页应用，大部分页面并不需要引用所有的 js 文件

## protractor e2e 测试

界面变动频繁时，e2e 测试不容易维护

## WeakMap

一个特殊的 map 结果，key 只能是引用类型，当某个 key 没有被引用后，会被 GC 自动情理掉

```
const weakmap = new WeakMap();
function f(){
    let a = { b: 1};
    weakmap.set(a, 2);
    console.log(weakmap); // WeakMap {Object {b: 1} => 2}
}
f();
// after a while
console.log(weakmap); // WeakMap {}
```

## web audio api

js 可以处理音频源（滤波、音量、延时、混响），可以实现不依赖网络延迟的音频播放

## html lint

还没有支持模板自定义 tag、attr 的工具

## headless chrome

替代 PhantomJS，用来测试前端界面、制作爬虫

## flow type

支持的编辑器少

## css3 animation keyframes

一个缺点是，keyframes 中的值不能被 js 动态修改，只能创建 style 元素，覆盖原来的 keyframes。

而这种方式会生成内联的 css，不能和 style-src 'unsafe-inline'兼容，所以可能存在安全问题。

## GraphQL

特点是由客户端决定返回哪些数据，适合要求 API 有强扩展性的场景。

缺点是，每个 field 都单独 resolve，性能低，需要使用 loader 来提高性能；

例外 query 可以无限嵌套，为了防止导致耗尽资源，需要有请求的资源耗用监视机制。

## chrome devtools audits 去除无用 css

只会识别当前使用的 css，只适合没有交互的简单页面。

## prepack

是 js to js 的代码优化工具；

产生的代码体积可能会变大；

对于不纯粹的代码，例如涉及到 dom 操作，还不可用；

生成的代码虽然性能更高，可能可读性变差、调试变困难。

## 富文本编辑器

可以考虑用带实时预览和 cheatsheet 的 markdown 编辑器来替代，字体颜色等可以通过内嵌 html 的方式解决。

## gRPC

基于 protobuf 和 http2 的 RPC 工具。

和 RESTful API 类似，适用于对外的接口。

## sass/scss

使用时，要么依赖 ruby 运行时（windows 上没有内置），要么会遭遇到安装 node-sass 的各种问题。

## vuejs,angular,reactjs 的 animation 或 transition 接口

完全可以使用 css3 的原生 animation 或 transition 来做，动画开始时设置 class，动画结束（通过延时来判断）后替换成新 class。

## postMessage API

是浏览器的跨源窗口间的通信接口；

监听事件时，需要验证 origin 和 source，过滤掉危险网站发送的消息。

## next.js

服务端 reactjs 程序

缺点：前后端没有分离，各自不好扩展；与 now 联系紧密

好的免费 solution 有很多，不至于要用这个

## http/2 server push

目的是用于推送资源，而不是数据推送

目前 nginx 还不支持

如果某些资源用户不会用到，把它推给用户会浪费带宽

需要浏览器支持，所以需要后备手段

## angular 的 pipe 和 vuejs 的 filter

不推荐使用，用 getter 替代，除非是内置的，或者非常简单的转换。

## fuse-box

与 webpack 类似的前端打包工具，比起 webpack，目前还不够成熟。

## sw-precache

用于生成 service worker 代码，不过生成的代码中含有大量的版权信息和注释，使用时还需要 uglify 生成的代码。

## push API

用于从服务器向处于后台的 web app 推送消息

浏览器支持问题，chrome 目前还不支持

## egg

基于 koa 的插件化框架，缺点同 koa；

可能是 KPI 的产物；

对除 HTTP 外的协议，例如 websocket，支持不好；

根据技术选型的正交原则，尽量不要采用这样大而全类型的框架。

## lerna

当一个仓库内，会 publish 多个 npm 包时，lerna 可以简化管理过程。

## yarn

相比 node 自带的 npm，yarn 提高了包恢复速度（离线、失败重试），并使包之间的依赖具有确定性，可以避免复杂依赖情况下，依赖结构不一致导致的 BUG。

## Kafka

性能比 ActiveMQ 等传统的消息队列高

## protobuf, json, bson

传输用 protobuf：因为 protobuf 的数据中不包含字段消息，所以会更小一些

公开 API 用 json：因为 json 数据是字符串，可读性更好，对 API 的调用更友好

存储用 bson：bson 基于 json，并针对存储做了改进

关于数据验证：protobuf 在解析时会根据 schema 自行验证；而 json 和 bson 需要在解析完成后，再用 json schema 验证，需要额外维护一份 json schema

## WebAssemply

目前发布了一个 RC，主流浏览器也开启了 preview 性支持，到 2017 年第 1 季度结束时，将会确定 draft 规范，浏览器随之开始正式支持了，可见进度还是非常快的。

对由 C++ 编译到 WebAssemply 的支持、WebAssemply 和 js 的交互 API 会最先被支持

浏览器中一部分性能敏感的代码很可能会用 C++ 来编写，再编译成 WebAssemply

nodejs 中一部分性能敏感的代码，之前会用 C++ 来编写，再通过 node-gyp 编译成平台相关的二进制被使用，之后，C++ 代码可能会被编译成 WebAssemply 来供 nodejs 使用

## WebRTC

连接建立时不稳定，可以长到好几秒钟

目前不支持发送 Blob 对象，需要转换成 Uint8Array 发送

发送大体积数据时，会被拆分成多个数据包发送，接收方需要手动合并，数据体积过大时会直接报错

数据发送语句是异步的，但是数据发送过程可能会阻塞 UI 刷新，它是在 UI 线程下执行的

目前 RTCDataChannel 还不能在 WebWorker 下工作，不过目前是有 proposal 的，目前还没有进入标准，也没有浏览器实现，所以还需要等一段时间。

## angular2

目前依赖太多，包太大，tree-shaking 在涉及到第三方库时基本不可用

数据更新机制复杂，涉及到 zonejs、更新策略，遇到过多次数据更新了但 UI 没有更新的问题

## comet

是一类基于 http 协议的 hack 技术，常用于实时推送。

以发展的眼光看，会不可避免地被 websocket 替代掉。

## coffeescript

+ 目前不支持 ES6
+ 目前没有支持 ES6 的计划

## serverless framework

+ 目前只有 aws 和 azure 支持
+ 不支持 websocket

## koa

目前（2016-09）koa 存在两个不兼容的版本：v1.x 和 v2.x

前者是稳定版本，使用 generator，后者目前是 alpha 版本，使用 async/await

在 koa 的迁移指南中，建议把 generator 替换成 promise，以方便迁移

在 async/await 被 node 原始支持之前（2016.10 左右），koa v2.x 都将会是 alpha 状态

如果采用 v1.x，以后会面临升级到 v2.x 的问题

如果采用 v2.x，需要等待 async/await 被 node 原始支持，之后还要等待相关的中间件同步升级到和 v2.x 匹配的程度

所以，目前不是在生产环境采用 koa 的好时机

而 express.js，中间件更丰富，升级平滑，对 promise 友好，对 async/await 友好，是目前 nodejs 上 http 框架的更好选择。

## react, react-router, redux

首先是 react，更新频率正常，单独用的话没什么问题

react-router，接口变化太快了，每次都是 breaking change

redux，和 react 和 react-router 配合时，还需要引入 react-redux 和 react-router-redux，依赖太多了

如果单独用，难以处理嵌套的数据模型

## nodejs ORM

目前 nodejs 的各个 ORM 库都不是统治地位，结果可能在一个项目使用 Sequelize，在另一个项目可能使用 orm2，导致学习成本翻倍。

目前的 ORM 需要引入一个库，为每个模型写 model，写映射，这样增加额外的代码，可能引入额外的 BUG。

因为 js 是弱类型语言，ORM 带来的对 SQL 的检查效果不如 java/C# 这类强类型语言，所以在实际使用时会感觉到没那么有用。

从优化 SQL 执行效率的角度，ORM 的效率上限比不上原生 SQL 的效率上限。

目前主流关系型数据库都在进化，例如开始可以存储 json（例如 mysql 5.7 之后的 `json_extract` 和 `json_set`），目前这些 ORM 还不支持这样的特性。

更推荐的做法是，使用原生 sql 语句，再把查询结果映射到 js 对象，这时候使用类型直接标注就可以做到了。

## docker

以 nodejs 程序角度，会打包 nodejs、应用程序、node_modules，所以体积会很大。即使只改动了几行代码，也要更新几百 MB 的镜像。

需要建私有仓库，来保证权限控制。

最大的优点是，部署时不用担心依赖之间的冲突，当依赖复杂时，会很省心。

## 前端框架的服务端渲染特性

会增加前后端偶合度、复杂度、后端压力。

因为代码都会在前后端被执行，所以代码中不能使用浏览器端才有的接口，例如 window、document。

目的一般是为了 SEO，但是一般内容型的网站才有 SEO 需求（非内容型的网站，例如邮箱、OA，没有 SEO 需求），一般内容型的网站的待 SEO 的内容（博客正文、新闻、回答）的业务逻辑相对较简单，可以在服务端渲染，而其它不需要 SEO 的内容（例如评论框、点赞按钮、转发按钮），则可以在页面加载完成后在前端渲染。

## 热更新

会增加复杂度，需要考虑其必要性。

后端如果有负载均衡机制，而且程序内不会有持久数据，可以通过控制各个程序的权值，先控制部分程序逐渐减少为 0 负载，更新后重启，再提高其权重，最终所有程序逐步实现热更新。

## mobx

常和 react 配合，是 redux 之外的另一个选择。

## cyclejs

优点：rxjs, typescript

缺点：目前小众，支持 jsx 但需要 babel 来支持到 tsx

## rust

优点：性能、语言特性和抽象

缺点：目前小众，开发体验还不够好，编辑器支持程度低，学习曲线太陡了，开发效率低

## java

优点：语法简单易学；程序运行效率较高，且稳定；招人容易

缺点：语言表达能力弱，有的简单问题需要大量的代码才能实现；java 项目有过度设计的倾向，滥用设计模式，过度封装，导致代码膨胀；程序设计时倾向于大量使用配置文件，降低了开发和维护效率。
