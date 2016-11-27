这个有多个语言的实现，其中js的实现在：https://github.com/ReactiveX/rxjs

简单说，这个是操作事件的集合，就像文档中介绍的那样：Think of RxJS as Lodash for events

### 新的理解

目前理解的Rx的核心在于Observable。

优势在于，通过发布订阅模式，实现数据输入和数据输出的解藕。

流是不可变对象，操作后，总是产生新的流，没有副作用。

数据的各个输出之间，也是解藕的，互不影响。

使用时，把各个数据源包装成Observable，可以直接订阅使用，如果有来自多个数据源的同一种数据，和并成一个Observable后，再订阅使用。

先分析各种情况下的Observable对象的产生方式。

#### `Observable.of`

```
const observable = Observable.of(1, 2, 3);
```

#### `Observable.fromPromise`

```
const observable = Observable.fromPromise(new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1500);
}))
```

#### `Observable.create`

```
const observable = Observable.create((observer: Observer<number>) => {
    setInterval(() => {
        observer.next(Date.now());
    }, 1000);
})
```

#### `Observable.fromEvent`

```
const observable = Observable.fromEvent(document.getElementById("id"), "keydown");
```

#### 流的合并

```
const observable = Observable.of(1, 2, 3).merge(Observable.of(4, 5, 6);
```

有了这个操作之后，多个输入可以汇入一个流中，方便处理。

#### 订阅式输出

例如有10个输出，每个输出都会是一个完整独立的输出，互不影响。

```
observable.subscribe(value => {
    console.log(value);
});
```

#### 流的转换

通过各种操作，把输入流转换成新的流。

```
observable.filter((value, index) => {
    return value % 2 == 0;
}).subscribe(value => {
    console.log(value);
});
```

###  旧的理解

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
那是因为，这只是库，还没有主流语言会在语言层面上内置支持它，所以使用前必须先包装一下，不够简洁。
