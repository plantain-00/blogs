javascript的callback hell一直被认为是一个大坑，为了解决这个问题，可以采用promise、generator，或者第三方的库（比如Async），而ES7中的async/await则可以很优雅地解决这类问题。有人会问，ES7还早吧？ES7标准确定了吗？node支持吗？浏览器支持吗？具体有什么好处呢？现在看不懂async/await逻辑怎么办？

#### ES7的进度

ES7的进度可以看https://github.com/tc39/ecma262 ，可以看到async/await已经~~达到stage 3~~完成，语法已经被确定，会基于Promise来实现（~~具体stage 3的含义可见https://tc39.github.io/process-document/ ，stage 3是“all semantics, syntax and API are completed described”~~）。

#### 支持情况

v8和ChakraCore这两个js引擎的最新版已经支持async/await，但node（更新：node v7.x开始支持了，将于2016-10发布）和大多数浏览器（目前只有Edge支持）还不支持。不过这个不是问题，因为有工具可以把ES7代码编译成ES6（在node中使用，因为node v4后支持大部分ES6特性）或ES5（在浏览器中使用），常用的工具有babel.js和typescript。

#### 简单例子

下面举个例子来说明具体用法，需求是先执行action1，如果结果是true，执行action2，否则执行action3。由于原生接口还是callback的形式，需要先把这些action转换成promise形式：

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

代码中的async关键字是个“修饰符”，类似于public/private/static等，async关键字会改变函数的返回值，如果函数返回一个number，加上async后会变成返回Promise<number>（`T `-> `Promise<T>`）。

代码中的await关键字是一个“运算符”，一元，类似于负号“-”，它的右边应该是个Promise，它的返回值会是这个Promise的结果（`Promise<T>` -> `T`）。

#### 编译后的代码

如果我不信任编译后的代码，怎么办？那就先看一下生成后的代码是什么样的，首先是typescript编译成ES6后的代码：

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

可以看到，增加了一个公用的__awaiter函数，三个action的代码没有变化，async/await被ES6的generator和yield替代，逻辑上并没有大的变化，编译前后的代码片段容易一一对应。

再看用babel.js编译成ES5后的代码：

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

可以看到，增加了一个公用的__awaiter函数，三个action的代码没有变化，async/await被替代，逻辑上变化要大一些，编译前后的代码片段一一对应起来要难一些。

#### 更复杂的例子

上面的例子比较简单，只有顺序执行和条件，可以看一些更复杂的例子，比如循环。一般如果要不定长数组里的promise依次执行，可以用函数式/递归来做，每次只处理第一个promise，处理后把数组的其它部分作为新数组递归执行，直到全部完成，比较麻烦。

而使用async/await的话，逻辑就很清晰：

```javascript
async function main(promises) { // promises是一个promise数组
    let result = 0;
    for(let promise of promises) {
        result += await promise;
    }
    return result;
}
```

#### 还可以使用Promise

当然，由于async/await是基于Promise，`Promise.all()`和`Promise.race()`也可以很方便地配合使用，从而更灵活地实现复杂逻辑。

```javascript
async function main(promises) { // promises是一个promise数组
    const results = await Promise.all(promises);
    return results.reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
    }, 0);
}
```

#### error处理

async/await的另一个好处是：error处理。

try...catch不能捕获callback里的抛出的异常，但是却可以捕获await的promise里抛出的异常（又可以做到像C/C++/JAVA/C#那样，一个try...catch捕获所有错误了）。这样就可以非常方便地处理error了，不用再担心哪个callback是不是忘了处理error，从而导致程序崩溃了。

#### 结论

目前，
1. 如果使用的node版本支持ES6，并且业务有点复杂度，可以考虑使用async/await编译到ES6。
2. 如果前端js的业务有点复杂度，并且可以容忍编译到ES5后的代码，可以考虑使用async/await编译到ES5。

另外async/await并不是ES7独有的，C#5.0和python3.5都有类似的语法，可以看下面的例子：

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
