### nodejs: 服务端 js 运行环境

### Js + nodejs 运行环境 + Npm 包管理器

+ Js:ECMAScript 的实现
+ Nodejs 中的 global 对象 / 浏览器中的 window 对象
+ Nodejs 标准库：fs/http/net/dgram/os/process…
+ Npm：类似于 maven

### 问题和方案

+ Js 的缺陷：严格模式、代码检查、 ES 新特性
+ CPU 核心：负载均衡
+ 服务守护：pm2
+ 包依赖和管理：语义化版本 / npm-check
+ Callback：Promise/Generator/async/await
+ Prototype 继承：Class 继承
+ 动态语言：类型系统（typescript/flowtype）
+ 模块系统：commonjs/ES2015
+ For..in：for…of
+ Var：const let
+ this in function：arrow function
+ ES 新特性：rest/spread/destructuring

### 常见的库

+ 推送：ws/uws/socket.io
+ http 服务：express.js
+ 数据流处理：Rxjs
+ oracle：oracledb
+ ActiveMQ：stompjs
+ 工具库：lodash/underscore
+ Redis：ioredis
+ http 请求调用：node-fetch/requestjs
