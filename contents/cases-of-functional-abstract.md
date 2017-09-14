# 几个简单的函数式抽象的实现

数学表示：

```
sum(f, g) = f + g;
```

js 代码实现：

```js
const sum = (f, g) => x => f(x) + g(x);
```

加上类型：

```ts
const sum = (f: (x: number) => number, g: (x: number) => number) => (x: number) => f(x) + g(x);
```

测试：

```
const f1 = (x: number) => x * x;
const f2 = (x: number) => x * 2 + 1;
const a = sum(f1, f2); // 应该是 x * x + x * 2 + 1
console.log(a(1)); //  应该是 4
console.log(a(2)); //  应该是 9
console.log(a(3)); //  应该是 16
```

不止是 js，其它大部分常见语言都可以实现这样的效果，例如 rust:

```rust
let sum = |f: Box<Fn(i32) -> i32>, g: Box<Fn(i32) -> i32>| Box::new(move |x| f(x) + g(x));
let a = sum(Box::new(|x| x * x), Box::new(|x| 2 * x + 1)); // 应该是 x * x + x * 2 + 1
println!("{}", a(1)); //  应该是 4
println!("{}", a(2)); //  应该是 9
println!("{}", a(3)); //  应该是 16
```

另一个更明显的例子是 “导函数”：

数学表示：

```
g(f) = f`;
```

js 代码实现：

```js
const g = f => x => (f(x) - f(x - 0.000001)) / 0.000001;
```

加上类型：

```ts
const g = (f: (x: number) => number) => (x: number) => (f(x) - f(x - 0.000001)) / 0.000001;
```

测试：

```
const a = g(x => x * x); // 应该是 x * 2, 也就是 x * x 的导函数
console.log(a(1)); //  应该是 2，实际是 1.999999000079633
console.log(a(2)); //  应该是 4，实际是 3.999998999582033
console.log(a(3)); //  应该是 6，实际是 5.999999000749767
```

导函数的定义中存在极限，这里取 0.000001，如果取更接近 0 的值，结果会更接近理论值。

下面是 rust 里的例子：

```rust
let g = |f: Box<Fn(f64) -> f64>| Box::new(move |x: f64| (f(x) - f(x - 0.000001)) / 0.000001);
let a = g(Box::new(|x| x * x)); // 应该是 x * 2, 也就是 x * x 的导函数
println!("{}", a(1f64)); //  应该是 2，实际是 1.999999000079633
println!("{}", a(2f64)); //  应该是 4，实际是 3.999998999582033
println!("{}", a(3f64)); //  应该是 6，实际是 5.999999000749767
```
