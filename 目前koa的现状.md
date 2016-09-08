目前（2016-09）koa存在两个不兼容的版本：v1.x和v2.x

前者是稳定版本，使用generator，后者目前是alpha版本，使用async/await

在koa的迁移指南中，建议把generator替换成promise，以方便迁移

在async/await被node原始支持之前（2016.10左右），koa v2.x都将会是alpha状态

如果采用v1.x，以后会面临升级到v2.x的问题

如果采用v2.x，需要等待async/await被node原始支持，之后还要等待相关的中间件同步升级到和v2.x匹配的程度

所以，目前不是在生产环境采用koa的好时机

而express.js，中间件更丰富，升级平滑，对promise友好，对async/await友好，是目前nodejs上http框架的更好选择。
