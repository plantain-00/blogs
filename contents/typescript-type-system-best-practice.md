# typescript 类型系统的最佳实践

### 一、typescript 的准备

1、安装 nodejs，打开 shell 运行 `npm init` 以初始化项目

2、运行 `npm i typescript --save-dev`，为 `package.json` 中的 `scripts` 节点增加 `"tsc": "tsc"`（选择本地安装而不是全局安装的原因是，为了避免多个项目间不同 typescript 版本的冲突）

3、创建如下内容的 `tsconfig.json` 文件：

```js
{
    "compilerOptions": {
        "module": "commonjs", // 根据实际情况选择模块类型，一般 nodejs/webpack 用 `commonjs`，require.js 用 `amd`
        "target": "es2015" // 根据 nodejs 或浏览器支持的 ES 版本来选择 target
    }
}
```

`tsconfig.json` 具体有哪些选项，可以参考 https://github.com/Microsoft/TypeScript-Handbook/blob/master/pages/tsconfig.json.md

4、用编辑器创建一个 `.ts` 文件，写入一些 js 代码并保存，运行 `npm run tsc`，这时应该有同名的 js 文件产生

### 二、增加类型

1、any，可以表示任意类型

```ts
let a: any;
```

2、number, boolean, string, array

```ts
const a: number = 1;
const b: boolean = false;
const c: string = "abc";
const d: number[] = [1, 2, 3];
const e: Array<string> = ["1", "2", "3"];
```

3、Function 和 Lambda：Function 类型的范围比 Lambda 更宽泛

```ts
const f: Function = (a, b) => a + b;
const g: (a: number, b: number) => number = (a, b) => a + b;
```

4、void 和 never

```ts
function a(): void {
    return;
}
function b(): never {
    throw "";
}
```

5、tuple 类型，经常与 array destructuring 一起使用

```ts
const [a, b]: [number, string] = [1, "a"];
```

6、Object，object as dictionary：Object 类型要比 dictionary 更宽泛

```ts
const a: Object = {
    b: 1,
    c: 2,
};
const b: { [key: string]: number } = {
    b: 1,
    c: 2,
};
```

7、使用 const enum 而不是 enum

因为 const enum 会完全内联，不会产生多余的 js 代码

```ts
const enum A {
    a,
    b,
}
```

8、使用 type 或 interface 来定义类型

当这个类型会被某个 class 实现的时候，使用 interface，否则使用 type。

```ts
interface A1 {
    b: number;
}
type A2 = {
    b: number;
}
```

9、使用 Intersection（&）来扩展类型，而不是 extends

```ts
interface B1 extends A1 {
    c: string;
}
type B2 = A2 & {
    b: number;
}
```

10、class 与 ES6 的 class 使用方式一致，不要只为了类型而使用 class，在生成 js 代码后，其它类型会被完全擦除掉，而 class 类型则不会

如果要对 class 的成员做权限控制，可以使用 abstract, private, protected

```ts
class Student {
    name: string;
    private age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }
}
```

上述有更简洁的写法：

```ts
class Student {
    private age: number;
    constructor(public name: string, age: number) {
        this.age = age;
    }
}
```

11、union type，用 "|" 来表示 ` 或 ` 的关系

```ts
let a: number | string = 1;
a = "abc";
```

可以 typeof 形式来区分部分 union 的类型：

```ts
function foo(a: number | string) {
    if (typeof a === "number") {
        console.log(a.toFixed(2));
    } else if (typeof a === "string") {
        return a.charAt(0);
    }
}
```

可以用 tagged union types 来区分带 tag 的 union 的类型：

```ts
function foo(c: { kind: "a", a: number } | { kind: "b", b: string }) {
    switch (c.kind) {
        case "a":
            console.log(c.a);
            break;
        case "b":
            console.log(c.b);
            break;
        default:
    }
}
```

12、使用 as 或! 来类型转换，而不是<>

```ts
const a: number | undefined = 1;
const b = a as number;
const c = <number>a;
const d = a!; // number | undefined 转换成 number
```

13、literal types，包括 null, undefined, string, number, enum, boolean

```ts
let a: "foo" | "bar" = "foo";
a = "foo"; // 类型匹配
a = "bar"; // 类型匹配
a = "bar2"; // 类型不匹配
```

14、泛型

```ts
function foo<T>(t: T) {
    return t;
}
```

还可以用用 extends 来限制泛型的类型：

```ts
function bar<T extends { a: number }>(t1: T, t2: T) {
    return t1.a + t2.a;
}
```

15、开启 strictNullChecks 和 noImplicitAny

16、readonly

```ts
const a: {readonly b: number} = { b: 1 };
a.b = 2; // 错误
```

17、区分 union 了空的类型，和 optional type（?）

前者只能取 union 的几个类型，不可缺省，后者可以缺省，且自动 union undefined。

```ts
const a: { b: number, c?: string } = { b: 1, c: "abc" };
const d: { b: number, c: string | undefined } = { b: 1, c: "abc" };
```

18、在第一个参数前，可以增加 this 的类型

```ts
function f(this: number, a: string) {
    console.log(this.toFixed(2));
}
```

生成的 js 中不会包含这个 this 参数：

```js
function f(a) {
    console.log(this.toFixed(2));
}
```

19、类型 {} 的真正含义，与直觉不一致，不推荐使用

20、keyof

```ts
interface Person {
    name: string;
    age: number;
}

let propName: keyof Person; // "name" | "age"
```

21、Partial, Readonly, Record, and Pick

```ts
interface Person {
    name: string;
    age: number;
}
let person1: Partial<Person> = {
    name: "abc",
};

let person2: Readonly<Person> = {
    name: "abc",
    age: 12,
};
person2.name = "aaa"; // error
```

总的来说，any 最宽松，然后是 Function 和 Object，然后是普通的类型，最严格的是开启了 strictNullChecks 和 noImplicitAny 的模式。

### 三、增加 lint

应该用 tslint 来统一代码风格，特别是对于团队项目

1、运行 `npm install tslint --save-dev`，为 `package.json` 中的 `scripts` 节点增加 `"lint": "tslint *.ts"`

2、创建如下内容的 `tslint.json` 文件：

```js
{
    "extends": "tslint:latest",
    "rules": {
    }
}
```

如果要覆盖默认的规则，可以在 "rules" 中覆盖，具体可见 https://palantir.github.io/tslint/rules/

3、运行 `npm run lint`，这时会提示代码中是否能通过检查（大部分主流编辑器和 IDE 都有 tslint 插件，可以用来实现实时的代码检查）
