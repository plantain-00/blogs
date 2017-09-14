# WebRTC 的通信模型

### 准备

使用 https://github.com/webrtc/adapter 库来屏蔽 chrome、firefox、edge 之间的差异，简化编程。

### 连接的建立

双方都要初始化 RTCPeerConnection，并创建 RTCDataChannel：

```js
const peerConnection = new RTCPeerConnection();
peerConnection.ondatachannel = event => {
    event.channel.onopen = e => {
        // connection opened
    };
    event.channel.onclose = e => {
        // connection closed
    };
    event.channel.onmessage = e => {
        // get message
    };
};
const dataChannel = peerConnection.createDataChannel("test_channel_name"); // 双方的 channel 名要一致
```

这时发起方需要发出邀约：

```js
peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
        // offer created
    }, error => {
        // error
    });
```

其中产生的 offer 是一个 RTCSessionDescription 对象

RTCPeerConnection 对象有一个 localDescription 和一个 remoteDescription，它们都是 RTCSessionDescription 对象，这里需要把发起方创建的 offer 设置为自己的 localDescription

RTCSessionDescription 对象由 type 和 sdp 字段组成，下面看一下一个 offer 例子：

```js
{
    type: "offer",
    sdp: `v=0
o=- 5188642327392386728 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=application 9 DTLS/SCTP 5000
c=IN IP4 0.0.0.0
a=ice-ufrag:/VT3
a=ice-pwd:ls9SkhIZU0j+sJ1vUkoopaOs
a=fingerprint:sha-256 C0:92:D6:0F:2B:14:98:30:18:AA:45:A7:FD:05:71:26:DE:2C:D8:4F:BB:E2:FC:17:1B:1E:29:07:02:7F:68:9B
a=setup:actpass
a=mid:data
a=sctpmap:5000 webrtc-datachannel 1024
`
}
```

这个例子里，type 字段表明这是一个 offer，dsp 中包含了 ip、端口、password 等消息。这个 offer 还不包含任何 candidate，可以稍后再执行一次 `createOffer` 过程，这样会创建一个新的 offer：

```js
{
    type: "offer",
    sdp: `v=0
o=- 5188642327392386728 3 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=application 61598 DTLS/SCTP 5000
c=IN IP4 192.168.20.104
a=candidate:4254130987 1 udp 2113937151 192.168.20.104 61598 typ host generation 0 network-cost 50
a=ice-ufrag:/VT3
a=ice-pwd:ls9SkhIZU0j+sJ1vUkoopaOs
a=fingerprint:sha-256 C0:92:D6:0F:2B:14:98:30:18:AA:45:A7:FD:05:71:26:DE:2C:D8:4F:BB:E2:FC:17:1B:1E:29:07:02:7F:68:9B
a=setup:actpass
a=mid:data
a=sctpmap:5000 webrtc-datachannel 1024
`
}
```

获得有效的 offer，可以把这个 offer 序列化成字符串，再通过 websocket 等其它方式传递给接收方：

```js
const offerString = JSON.stringify(offer.toJSON());
```

接收方获得这个字符串后，可以反序列化成 RTCSessionDescription 对象：

```js
const offer = new RTCSessionDescription(JSON.parse(offerString));
```

然后，接收方开始针对这个 offer 给予反馈：

```js
peerConnection.setRemoteDescription(offer)
    .then(() => peerConnection.createAnswer())
    .then(answer => peerConnection.setLocalDescription(answer))
    .then(() => {
        // get answer
    }, error => {
        // error
    });
```

这里需要把发起方发出的 offer 设为 remoteDescription，再把自己的 answer 设为 localDescription。

offer 和 answer 都是 RTCSessionDescription 对象，自己产生的就设为 localDescription，别人发给我的就设为 remoteDescription。

下面是一个 answer 的例子：

```js
{
    type: "answer",
    sdp: `v=0
o=- 6737343248045853171 3 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=application 51524 DTLS/SCTP 5000
c=IN IP4 192.168.20.104
b=AS:30
a=candidate:4254130987 1 udp 2113937151 192.168.20.104 51524 typ host generation 0 network-cost 50
a=ice-ufrag:g3Yt
a=ice-pwd:XPhmlHFTadm0MVCtr2OgrrOc
a=fingerprint:sha-256 85:06:C4:1E:64:70:D5:3F:2F:6A:23:58:1E:B2:1C:D5:9F:64:12:02:AA:AA:BD:C2:0B:7D:0E:92:D0:D5:63:60
a=setup:active
a=mid:data
a=sctpmap:5000 webrtc-datachannel 1024
`
}
```

answer 里也可能没有 candidate，如果那样，可以再试一次，没有 candidate 的 offer 和 answer 很可能建立不了连接。

现在，需要需要把这个 answer 序列化成字符串后，再通过 websocket 等方式传递给发起方，发起方再反序列化成 RTCSessionDescription 对象。

发起方获得 answer 后，再把它设为自己的 remoteDescription。

这时候，点对点的连接就应该建立起来了，双方的 onopen 事件都会被触发，之后发起方和接收方会直接通信，就不需要 websocket 参与了。

### 发送数据

连接建立后，双方都可以向对方发送消息，对方会在 onmessage 事件中收到消息：

```js
dataChannel.send("Hello world!");
```

发送的内容可以是字符串和二进制数据，例如用于传输文本、protobuf 编码的数据、文件、音频、视频。
