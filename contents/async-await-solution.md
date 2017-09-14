# async / await方案

javascript 的 callback hell 一直被认为是一个大坑

为了解决这个问题，可以采用 promise、generator，或者第三方的库（比如 Async）

而 ES7 中的 async/await 则可以很优雅地解决这类问题。

有人会问，ES7 还早吧？ES7 标准确定了吗？node 支持吗？浏览器支持吗？具体有什么好处呢？现在看不懂 async/await 逻辑怎么办？

### ES7 的进度

ES7 的进度可以看 https://github.com/tc39/ecma262 ，可以看到 async/await 已经~~达到 stage 3~~完成，语法已经被确定，会基于 Promise 来实现（~~ 具体 stage 3 的含义可见 https://tc39.github.io/process-document/ ，stage 3 是 “all semantics, syntax and API are completed described”~~）。

### 支持情况

v8 和 ChakraCore 这两个 js 引擎的最新版已经支持 async/await，但 node（更新：node v7.x 开始支持了，将于 2016-10 发布）和大多数浏览器（目前只有 Edge 支持）还不支持。不过这个不是问题，因为有工具可以把 ES7 代码编译成 ES6（在 node 中使用，因为 node v4 后支持大部分 ES6 特性）或 ES5（在浏览器中使用），常用的工具有 babel.js 和 typescript。

### 简单例子

下面举个例子来说明具体用法，需求是先执行 action1，如果结果是 true，执行 action2，否则执行 action3。由于原生接口还是 callback 的形式，需要先把这些 action 转换成 promise 形式：

```javascript
"use strict";

function action1Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}
function action2Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}
function action3Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(123);
        }, 1000);
    });
}
```

代码是：

```javascript
async function main() { // void -> Promise<void>
    let result1 = await action1Async(); // Promise<boolean> -> boolean
    if (result1 === true) {
        await action2Async(); // Promise<void> -> void
    } else {
        let result3 = await action3Async(); // Promise<number> -> number
        console.log(result3);
    }
}

main();
```

代码中的 async 关键字是个 “修饰符”，类似于 public/private/static 等，async 关键字会改变函数的返回值，如果函数返回一个 number，加上 async 后会变成返回 Promise<number>（`T `-> `Promise<T>`）。

代码中的 await 关键字是一个 “运算符”，一元，类似于负号 “-”，它的右边应该是个 Promise，它的返回值会是这个 Promise 的结果（`Promise<T>` -> `T`）。

### 编译后的代码

如果我不信任编译后的代码，怎么办？那就先看一下生成后的代码是什么样的，首先是 typescript 编译成 ES6 后的代码：

```javascript
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }
        function onfulfill(value) { try { step("next", value); } catch (e) { reject(e); } }
        function onreject(value) { try { step("throw", value); } catch (e) { reject(e); } }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
function action1Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 1000);
    });
}
function action2Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
}
function action3Async() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(123);
        }, 1000);
    });
}
function main() {
    return __awaiter(this, void 0, Promise, function* () {
        let result1 = yield action1Async();
        if (result1 === true) {
            yield action2Async();
        }
        else {
            let result3 = yield action3Async();
            console.log(result3);
        }
    });
}
main();
```

可以看到，增加了一个公用的__awaiter 函数，三个 action 的代码没有变化，async/await 被 ES6 的 generator 和 yield 替代，逻辑上并没有大的变化，编译前后的代码片段容易一一对应。

再看用 babel.js 编译成 ES5 后的代码：

```javascript
"use strict";
var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, Promise, generator) {
    return new Promise(function (resolve, reject) {
        generator = generator.call(thisArg, _arguments);
        function cast(value) {
            return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) {
                resolve(value);
            });
        }
        function onfulfill(value) {
            try {
                step("next", value);
            } catch (e) {
                reject(e);
            }
        }
        function onreject(value) {
            try {
                step("throw", value);
            } catch (e) {
                reject(e);
            }
        }
        function step(verb, value) {
            var result = generator[verb](value);
            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);
        }
        step("next", void 0);
    });
};
function action1Async() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(true);
        }, 1000);
    });
}
function action2Async() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, 1000);
    });
}
function action3Async() {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(123);
        }, 1000);
    });
}
function main() {
    return __awaiter(this, void 0, Promise, regeneratorRuntime.mark(function callee$1$0() {
        var result1, result3;
        return regeneratorRuntime.wrap(function callee$1$0$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return action1Async();

                case 2:
                    result1 = context$2$0.sent;

                    if (!(result1 === true)) {
                        context$2$0.next = 8;
                        break;
                    }

                    context$2$0.next = 6;
                    return action2Async();

                case 6:
                    context$2$0.next = 12;
                    break;

                case 8:
                    context$2$0.next = 10;
                    return action3Async();

                case 10:
                    result3 = context$2$0.sent;

                    console.log(result3);

                case 12:
                case "end":
                    return context$2$0.stop();
            }
        }, callee$1$0, this);
    }));
}
main();
```

可以看到，增加了一个公用的__awaiter 函数，三个 action 的代码没有变化，async/await 被替代，逻辑上变化要大一些，编译前后的代码片段一一对应起来要难一些。

### 更复杂的例子

上面的例子比较简单，只有顺序执行和条件，可以看一些更复杂的例子，比如循环。一般如果要不定长数组里的 promise 依次执行，可以用函数式 / 递归来做，每次只处理第一个 promise，处理后把数组的其它部分作为新数组递归执行，直到全部完成，比较麻烦。

而使用 async/await 的话，逻辑就很清晰：

```javascript
async function main(promises) { // promises 是一个 promise 数组
    let result = 0;
    for(let promise of promises) {
        result += await promise;
    }
    return result;
}
```

### 还可以使用 Promise

当然，由于 async/await 是基于 Promise，`Promise.all()` 和 `Promise.race()` 也可以很方便地配合使用，从而更灵活地实现复杂逻辑。

```javascript
async function main(promises) { // promises 是一个 promise 数组
    const results = await Promise.all(promises);
    return results.reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
    }, 0);
}
```

### error 处理

async/await 的另一个好处是：error 处理。

try...catch 不能捕获 callback 里的抛出的异常，但是却可以捕获 await 的 promise 里抛出的异常（又可以做到像 C/C++/JAVA/C# 那样，一个 try...catch 捕获所有错误了）。这样就可以非常方便地处理 error 了，不用再担心哪个 callback 是不是忘了处理 error，从而导致程序崩溃了。

### 结论

目前，
1. 如果使用的 node 版本支持 ES6，并且业务有点复杂度，可以考虑使用 async/await 编译到 ES6。
2. 如果前端 js 的业务有点复杂度，并且可以容忍编译到 ES5 后的代码，可以考虑使用 async/await 编译到 ES5。

另外 async/await 并不是 ES7 独有的，C#5.0 和 python3.5 都有类似的语法，可以看下面的例子：

```csharp
    public async Task<ActionResult> Register(User user)
    {
        await Account.Value.Register(user); // Task<void> -> void
        await Mail.Value.NeedApproval(); // Task<void> -> void
        return RedirectToAction("Index", "Home"); // ActionResult -> Task<ActionResult>
    }
```

```python
import asyncio

async def http_get(domain):
    reader, writer = await asyncio.open_connection(domain, 80)

    writer.write(b'\r\n'.join([
        b'GET / HTTP/1.1',
        b'Host: %b' % domain.encode('latin-1'),
        b'Connection: close',
        b'', b''
    ]))

    async for line in reader:
        print('>>>', line)

    writer.close()

loop = asyncio.get_event_loop()
try:
    loop.run_until_complete(http_get('example.com'))
finally:
    loop.close()
```
