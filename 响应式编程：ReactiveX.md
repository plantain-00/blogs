这个有多个语言的实现，其中js的实现在：https://github.com/ReactiveX/rxjs
简单说，这个是操作事件的集合，就像文档中介绍的那样：Think of RxJS as Lodash for events
常见场景：
+ tcp/websocket的连接、发送和接收消息
+ 键盘、鼠标事件
+ 触摸屏事件
+ ajax请求
+ rpc调用的结果

使用时，先把事件转换成Observable：
```ts
document.getElementById("id").addEventListener("keydown", function (e) {
    // todo
});
```
```ts
import { Observable } from "rxjs/Rx";
const observable = Observable.fromEvent<KeyboardEvent>(document.getElementById("id"), "keydown");
observable.subscribe((e: KeyboardEvent) => {
    // todo
});
```
嵌套的事件也可以转换成Observable：
```ts
import { Observable } from "rxjs/Rx";
declare const server: SocketIO.Server;
server.on("connection", (connection: SocketIO.Socket) => {
    connection.on("message", (message: string) => {
        // todo
    });
});
```
```ts
import { Observable } from "rxjs/Rx";
declare const server: SocketIO.Server;
const connectionObservable = Observable.fromEvent<SocketIO.Socket>(server, "connection");
connectionObservable.subscribe(socket=> {
    const messageObservable = Observable.fromEvent<string>(socket, "message");
    messageObservable.subscribe(message => {
        // todo
    });
});
```
获得Observable后，可以使用filter，和集合的filter类似，例如过滤键盘输入事件，按回车时继续，否则停止：
```ts
document.getElementById("id").addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        // todo
    }
});
```
```ts
const observable = Observable.fromEvent<KeyboardEvent>(document.getElementById("id"), "keydown");
observable.filter(o => o.keyCode === 13).subscribe((e: KeyboardEvent) => {
    // todo
});
```
还可以使用map，和集合的map类似，例如批量处理接收的消息：
```ts
declare const server: any;
server.on("connection", (connection: SocketIO.Socket) => {
    connection.on("message", (message: string) => {
        message = `hello, ${message}`;
        // todo
    });
});
```
```ts
const connectionObservable = Observable.fromEvent<SocketIO.Socket>(server, "connection");
connectionObservable.subscribe(socket => {
    const messageObservable = Observable.fromEvent<string>(socket, "message");
    messageObservable.map(m => `hello, ${m}`).subscribe(message => {
        // todo
    });
});
```
权衡：
响应式编程是一种编程思维，非常善于处理复杂的事件
但是，对于很少有事件的领域，也没有发挥的地方
对于不很复杂的逻辑，会带来额外的复杂度
那是因为，这只是库，还没有主流语言会在语言层面上内置支持它，所以使用前必须先包装一下，不够简洁