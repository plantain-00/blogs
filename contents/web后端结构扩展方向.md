#### web应用

这是一个起点。
几乎所有的语言都可以用来做web后端，目前最流行的应该是php和java，而ruby、python、node、C#等等也有很多人在用。
目前的趋势是，不在服务器端渲染页面，使用RESTful API，使用轻量级的框架。

#### 常规数据库

大部分web应用都会有存储需求，常用的有mysql，也有用mariadb或postgresql。

#### NoSQL

在数据库查询速度方面，NoSQL有优势。
除此之外，NoSQL数据库的设计思路也和普通数据库的不一致，不再严格遵守三个范式，允许数据冗余，也适合存储结构不固定的数据，所以可以用来弥补常规数据库的缺陷。
常见的NoSQL数据库有mongodb。

#### 缓存

在适当的地方使用缓存，可以有效提高查询性能。
常用的缓存工具有memcache、redis。
对于被动缓存，例如某个数据1秒内有1000个请求，第一个请求获取到数据并把数据存入过期时间1秒的缓存，其它请求就可以直接从缓存中读取了。对于主动缓存，系统启动后就开始读取数据到缓存，数据更新时，主动更新缓存中的数据。

#### 服务层

当某些功能会被多个web应用调用，可以被抽出到新的服务层，web应用通过rpc的方式调用这些服务。
rpc方式可以用直接基于TCP协议的框架，也可以用基于http的框架，数据格式可以是自定义、XML、json，也可以是RESTful API的形式。
另外，对于node，CPU密集型任务也应该被抽离成服务，以避免影响并发。
从这个角度看，数据库和缓存可以认为是数据库服务和缓存服务。
但服务层里服务越来越多，服务间的相互调用也越来越多，可以使用协调工具来管理这些服务，如zookeeper。

#### 推送

可以使用node.js的socket.io实现。
socket.io实现的WebSocket协议，不只提供了基础的消息广播功能，也提供了更轻量级的方法使得客户端可以向服务器端发送信息。
为了保证推送质量，需要客户端在接收到推送后发送反馈。
socket.io连接示例：
```js
// server
import * as express from "express";
import * as socketIO from "socket.io";

const app = express();
const server = app.listen(3000);
const io = socketIO(server);
const promotions = io.of("/promotions");

promotions.on("connection", socket => {

});
```
```html
// client
<script>
    var socket = io("http://localhost:3000/promotions");
</script>
```
加入基于cookie的身份验证后：
```js
// server
import * as express from "express";
import * as socketIO from "socket.io";
// changes start
import * as cookie from "cookie";
import * as validator from "validator";
import * as services from "./services";
// changes end

const app = express();
const server = app.listen(3000);
const io = socketIO(server);
const promotions = io.of("/promotions");

promotions.on("connection", socket => {
    // changes start
    const cookies = libs.cookie.parse(validator.trim(socket.handshake.headers.cookie));
    services.validate(cookies["cookie_name"]).then(userId => {
        if (!userId) {
            socket.disconnect(true);
        }
    });
    // changes end
});
```
加入广播功能后：
```js
// server
import * as express from "express";
import * as socketIO from "socket.io";
import * as cookie from "cookie";
import * as validator from "validator";
import * as services from "./services";

const app = express();
const server = app.listen(3000);
const io = socketIO(server);
const promotions = io.of("/promotions");

promotions.on("connection", socket => {
    const cookies = libs.cookie.parse(validator.trim(socket.handshake.headers.cookie));
    services.validate(cookies["cookie_name"]).then(userId => {
        if (!userId) {
            socket.disconnect(true);
        // changes start
        } else {
            socket.join("room_name");
        }
        // changes end
    });
});

// changes start
const promotion = {

};
promotions.to("room_name").emit("promotion", promotion);
// changes end
```
```js
// client
socket.on("promotion", promotion => {

});
```
加入客户端到服务器端的通信后：
```js
// server
import * as express from "express";
import * as socketIO from "socket.io";
import * as cookie from "cookie";
import * as validator from "validator";
import * as services from "./services";

const app = express();
const server = app.listen(3000);
const io = socketIO(server);
const promotions = io.of("/promotions");

promotions.on("connection", socket => {
    const cookies = libs.cookie.parse(validator.trim(socket.handshake.headers.cookie));
    services.validate(cookies["cookie_name"]).then(userId => {
        if (!userId) {
            socket.disconnect(true);
        } else {
            socket.join("room_name");
            // changes start
            socket.on("promotion accepted", promotionId => {

            });
            // changes end
        }
    });
});

const promotion = {

};
promotions.to("room_name").emit("promotion", promotion);
```
```js
// client
socket.on("promotion", promotion => {
    // changes start
    socket.emit("promotion accepted", promotion.id);
    // changes end
});
```
对于多socket.io节点，可以使用https://github.com/socketio/socket.io-redis ：
```js
// server
import * as express from "express";
import * as socketIO from "socket.io";
import * as cookie from "cookie";
import * as validator from "validator";
import * as services from "./services";
// changes start
import * as socketioRedis from "socket.io-redis";
// changes end

const app = express();
const server = app.listen(3000);
const io = socketIO(server);
const promotions = io.of("/promotions");
// changes start
io.adapter(socketioRedis({
    host: "127.0.0.1",
    port: 6379,
}));
// changes end

promotions.on("connection", socket => {
    const cookies = libs.cookie.parse(validator.trim(socket.handshake.headers.cookie));
    services.validate(cookies["cookie_name"]).then(userId => {
        if (!userId) {
            socket.disconnect(true);
        } else {
            socket.join("room_name");
            socket.on("promotion accepted", promotionId => {

            });
        }
    });
});

const promotion = {

};
promotions.to("room_name").emit("promotion", promotion);
```
```js
// client
socket.on("promotion", promotion => {
    socket.emit("promotion accepted", promotion.id);
});
```

#### 全文搜索

#### 消息队列

消息队列可以实现异步调用，也可以缓冲任务。
除了各种MQ，redis也可以作为轻量级的消息队列。
也可以使用分布式的https://github.com/apache/kafka 。

#### 业务拆分和横向扩展

拆分业务后，可以简化系统复杂度。横向扩展可以分摊负载。
对于session不能共享的问题，可以通过把session内容保存到缓存中来解决。

#### 数据库的主从复制

考虑到读操作的频率要远大于写操作，读写分离后，可以大幅减轻读库压力，还方便扩展。

#### 分库和分表

#### 异地双机热备

为了解决机房断电断网后的系统可用性问题，可以设计异地双机热备方案，各种服务都有能够相互同步。