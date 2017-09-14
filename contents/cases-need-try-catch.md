# 需要 try catch 的场景

#### CLI 程序

+ 一般不需要 try...catch ，如果出现错误，直接退出
+ 对于 watch 类的 CLI，如果需要出现错误时继续 watch ，不退出程序，则需要 try...catch

#### 服务端程序

+ 对于启动时的加载错误、初始化错误、连接错误，不需要 try...catch ，如果出现错误，直接退出
+ 对于程序启动后，传入了数据（例如请求参数、请求体），如果存在 throw error 的可能，需要 try...catch ，以避免因为单个请求的出错导致程序崩溃，从而影响其它请求的处理过程

#### promise catch

如果有 promise ，在 promise 中 catch 异常， 要更简单一些

#### 客户端程序

如果要对用户输入的数据做处理的过程可能存在错误，需要 try...catch ，并在界面上给予必要的提示

#### 库

对于可能抛出异常的方法，需要在 jsDoc 上增加 @throws 声明

#### 常见的可能 throw error 的场景

+ parse：例如 JSON、protobuf、TextDecoder
+ decode：例如 protobuf、TextDecoder
+ fs 或网络相关的 constructor：例如 new WebSocket(url)
+ require js 模块

规律是，如果需要的参数不符合规则时，会导致失败，但方法没有返回 Promise ，也没有 error callback ，则肯定会 throw error

例如，`fs.read` 有 error callback，而 `fs.readSync` 则没有返回 Promise 和 error callback，如果出错，则会 throw error

#### 大量的验证逻辑

如果有大量的验证逻辑，如果改成每个验证逻辑都 throw error，或 assert，再统一 catch，则会简化代码

#### 出错时释放资源

#### 出错时设置 fall back 值，并继续执行
