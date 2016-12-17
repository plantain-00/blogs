### `npm init` + 单文件

`npm init`可以产生`package.json`文件，配合单js文件，组成最简单的形式。

### 分拆模块

当逻辑越来越复杂，有必要把代码拆分成不同的模块，也可以提高代码复用；
nodejs的模块形式是commonjs，同步加载，一个文件就是一个模块，文件名就是模块名。

### 多入口

如果要进行业务拆分，可以拆分成不同的仓库，不过，这样降低代码的复用，有一些公共逻辑，例如类型、原型（prototype）、公共方法，就被复制在不同的仓库，或者比较麻烦的submodule的方式，甚至由于库的版本不一致，而产生不必要的BUG。
多入口则是一个比较好的方式，共用一个仓库，共用所有模块，对于每个模块，如果有必要初始化，暴露一个初始化方法，由入口文件决定是否初始化。
多入口的缺点是，每个入库都会同步加载所有的模块代码，即使用不到其中一部分，不过这只是代码的大小，可以预期不会很大。
```js
// app1.js
const libs = require("./libs");
const services = require("./services");
services.foo.init();
services.baz.init();
```
```js
// app2.js
const libs = require("./libs");
const services = require("./services");
services.foo.init();
services.bar.init();
```

### 公共外部库

当模块越来越多，每个模块都会或多或少导入一些外部模块，但是由于commonjs的特性，不会重复导入已经导入的模块，这样外部模块的导入声明，大部分是重复的声明，并没有实际的动作；
可以使用公共的专用于引入外部模块的模块，例如`libs.js`，导入模块后，例如导出，在其它模块中，只需要用如下的方式来引入外部模块了：
```js
// libs.js
export const url = require("url");
export const express = require("express");
export const http = require("http");
```
```js
// foo.js
const libs = require("./libs");
libs.url;
libs.express;
libs.http;
```
```js
// bar.js
const libs = require("./libs");
libs.url;
libs.express;
libs.http;
```

### 公共内部模块

由上一条，可以联想到，有很多内部模块，也会或多或少引用其它内部模块，也有很大重复，可以利用类似的策略：
```js
// services.js
export const foo = require("./foo");
export const bar = require("./bar");
export const a = require("./a");
export const b = require("./b");
```
```js
// a.js
const libs = require("./libs");
const services = require("./services");
libs.url;
libs.express;
libs.http;
services.foo.something();
services.bar.anotherThing();
```
```js
// b.js
const libs = require("./libs");
const services = require("./services");
libs.url;
libs.express;
libs.http;
services.foo.something();
services.bar.anotherThing();
```

### 用目录来组织代码

例如，内部模块可以全部放在`services/`或`modules/`里；
代码可以都放在`src/`里，生成的代码放在`dist/`里，测试文件放在`tests/`里；
其它类似的还有`docs/`、`scripts/`、`resources/`等等。

### view层

一般不推荐在后台渲染页面，如果一定要这样做，可以放在`views/`或`templates/`里。

### 内部模块的可测试性

当一个内部模块直接调用其它内部模块，或外部库时，如果涉及到文件操作、网络操作、数据库操作、其它服务等，因为代码耦合严重，不便测试。

这时可以通过，把所要调用的的函数，移到参数中，以减少耦合度。

```ts
function foo() {
    return 123;
}

function bar(_foo: typeof foo) {
    return 1 + _foo();
}

// 调用时
bar(foo);

// 测试时
bar(() => 234);
```

上面是移到函数参数的形式。如果使用了class，可以把method公共的依赖，移到constructor中。

```ts
function foo() {
    return 123;
}
class Bar {
    constructor(private _foo: typeof foo) { }
    bar() {
        return 1 + this._foo();
    }
}

// 调用时
const bar1 = new Bar(foo);
bar1.bar();

// 测试时
const bar2 = new Bar(() => 234);
bar2.bar();
```
