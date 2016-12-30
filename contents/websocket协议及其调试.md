对于websocket，handshake阶段基于http协议，成功后可以异步传输frame数据。

frame数据传输阶段基于tcp协议，实现了事件驱动，消息作为一个整体，而接收时则不必关心frame的大小和组装问题。

websocket需要额外的ping/pong机制（类似于心跳）来保证长连接，socket.io内部默认会每隔25秒ping一次服务端，默认超时60秒，超时就可以认为连接断开。

不同于http协议，postman等调试工具没办法调试websocket。

websocket调试工具可以是chrome的developer tool，它可以查看handshake阶段的请求，以及实时的frame数据。

如果需要从浏览器端向服务端发送数据，可以在chrome的console中发送，frame中的发出和接收到的数据会以不同的颜色加以区分。

其它在线的调试工具有：http://www.websocket.org/echo.html 。

使用socket.io作为服务端时，可以观察到传输的数据是如下格式：

```
5
42["test",{"key":"value"}]
2
3
```

由于socket.io在1.0之后，是基于engine.io来实现的，所以这些数据格式是由engine.io的协议来确定的，链接在：https://github.com/socketio/engine.io-protocol 。

简单来说，5表示升级协议，2标识ping，3标识接收到的pong，4表示消息，`test`是事件名称，`{"key":"value"}`是JSON字符串形式的数据。

可以看到，要传输同样的数据，websocket传输的数据量要远远小于http协议，这也是websocket的优势之一。
