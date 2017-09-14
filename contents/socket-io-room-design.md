# socket.io 的 room 设计

在 socket.io 中，基本用法是，join 一个 room，并向一个 room 发送消息，所有 join 这个 room 的连接都会收到消息。

每个连接是可以 join 多个 room 的，例如，每个连接都会 join 自己的 socket id，所以可以把 socket id 当成 room，相应的 socket 会收到连接。

这样一来，room 更类似于 tag，连接后：

1. 默认打上自己 socket id 的 tag，常用于对该连接发送消息；
2. join 某个房间都打上该 room 的 tag，可以用于在这个房间内广播消息，例如聊天；
3. 登录的用户 join 类似 `users/${userId}` 的 tag 时，可以用于对该用户的所有连接发送消息，例如站内消息提醒；
4. 如果用户是某个角色，join 这个角色名的 tag，可以用于对所有是该角色的用户广播，例如管理员；
5. 如果已登录用户进入某房间，打上 `rooms/${room}/users/${userId}` 的 tag，可以用于对该房间的该用户发送消息，例如私聊；
6. 如果打上 "rooms" 的 tag（对所有房间的所有用户发送消息，例如实时公告）。

对于主动断开其它节点的连接的需求，可以让每个节点都订阅某个 channel，收到的消息中包含 tag，再遍历本地的 tags，一旦有连接的 tags 包含这个 tag，断开连接：

```ts
for (const socketId in server.sockets.sockets) {
    const socket = sockets[socketId];
    for (const room in socket.rooms) {
        if (room === tag) {
            socket.disconnect(true);
            break;
        }
    }
}
```
