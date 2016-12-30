在socket.io中，基本用法是，join一个room，并向一个room发送消息，所有join这个room的连接都会收到消息。

每个连接是可以join多个room的，例如，每个连接都会join自己的socket id，所以可以把socket id当成room，相应的socket会收到连接。

这样一来，room更类似于tag，连接后：

1. 默认打上自己socket id的tag，常用于对该连接发送消息；
2. join某个房间都打上该room的tag，可以用于在这个房间内广播消息，例如聊天；
3. 登录的用户join类似`users/${userId}`的tag时，可以用于对该用户的所有连接发送消息，例如站内消息提醒；
4. 如果用户是某个角色，join这个角色名的tag，可以用于对所有是该角色的用户广播，例如管理员；
5. 如果已登录用户进入某房间，打上`rooms/${room}/users/${userId}`的tag，可以用于对该房间的该用户发送消息，例如私聊；
6. 如果打上"rooms"的tag（对所有房间的所有用户发送消息，例如实时公告）。

对于主动断开其它节点的连接的需求，可以让每个节点都订阅某个channel，收到的消息中包含tag，再遍历本地的tags，一旦有连接的tags包含这个tag，断开连接：

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
