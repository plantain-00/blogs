对于 websocket，handshake 阶段基于 http 协议，成功后可以异步传输 frame 数据。

frame 数据传输阶段基于 tcp 协议，实现了事件驱动，消息作为一个整体，而接收时则不必关心 frame 的大小和组装问题。

websocket 需要额外的 ping/pong 机制（类似于心跳）来保证长连接，socket.io 内部默认会每隔 25 秒 ping 一次服务端，默认超时 60 秒，超时就可以认为连接断开。

不同于 http 协议，postman 等调试工具没办法调试 websocket。

websocket 调试工具可以是 chrome 的 developer tool，它可以查看 handshake 阶段的请求，以及实时的 frame 数据。

如果需要从浏览器端向服务端发送数据，可以在 chrome 的 console 中发送，frame 中的发出和接收到的数据会以不同的颜色加以区分。

其它在线的调试工具有：http://www.websocket.org/echo.html 。

使用 socket.io 作为服务端时，可以观察到传输的数据是如下格式：

```
5
42["test",{"key":"value"}]
2
3
```

由于 socket.io 在 1.0 之后，是基于 engine.io 来实现的，所以这些数据格式是由 engine.io 的协议来确定的，链接在：https://github.com/socketio/engine.io-protocol 。

简单来说，5 表示升级协议，2 标识 ping，3 标识接收到的 pong，4 表示消息，`test` 是事件名称，`{"key":"value"}` 是 JSON 字符串形式的数据。

可以看到，要传输同样的数据，websocket 传输的数据量要远远小于 http 协议，这也是 websocket 的优势之一。
