这类工具带来的主要好处是：代码提示、类型检查，前者提高开发效率，后者可以检查出潜在的bug。

### 1. jsDoc

```js
/**
 * @param {string} str
 * @returns {string}
 */
function md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}
```

这本质是一种类型标注，一般的IDE都可以识别jsDoc里的类型，不过jsDoc支持的类型有限

### 2. typescript

```ts
function md5(str: string) {
    return crypto.createHash("md5").update(str).digest("hex");
}
```

这本质是一种语言，扩展名需要是`ts`，大部分编辑器和IDE都支持这种方式

### 3. flowtype

```js
/* @flow */
function md5(str: string) {
    return crypto.createHash("md5").update(str).digest("hex");
}
```

这本质是一个静态类型检查工具，而转换成js代码的功能需要babel.js，而且目前还不支持windows，目前只有少部分编辑器和一个专用的IDE支持

### 4. typescript提供了一个名为salsa的服务

```js
/**
 * @param {string} str
 * @returns {string}
 */
function md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}
```

此服务从jsDoc中读取类型，并交给typescript编译器来处理，结果在不修改原有代码、不改变语言、不需要转换过程的前提下，获得typescript提供的能力，目前只有少部分编辑器和IDE支持

下面一个例子介绍怎么定义一个复杂的类型：

```ts
// foo.d.ts
export type Foo = {
    foo1: number;
    foo2: string;
    foo3: () => void;
}
```

```js
/// <reference path="./foo.d.ts">

/**
 * @param {Foo} foo
 * @returns {void}
 */
function bar(foo) {
    foo.foo3();
}
```
