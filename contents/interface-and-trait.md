# interface 和 trait

一般是抽象于一种能力，内部包含一个或多个函数，然后会有 class 来实现它，从而该 class 就拥有这种能力。

在 java/C#/typescript 中被称为 interface，在 rust/scala 中被称为 trait。

下面是一个 interface 的例子：

```ts
interface HasArea {
    area(): number;
    is_larger(other: HasArea): boolean;
}

class Circle implements HasArea {
    constructor(public x: number, public y: number, public radius: number) { }
    area() {
        return Math.PI * (this.radius * this.radius);
    }
    is_larger(other: Circle) {
        return this.area() > other.area();
    }
}
```

下面是 rust 中的 trait 的例子：

```rust
trait HasArea {
    fn area(&self) -> f64;
    fn is_larger(&self, &Self) -> bool;
}

struct Circle {
    x: f64,
    y: f64,
    radius: f64,
}

impl HasArea for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * (self.radius * self.radius)
    }
    fn is_larger(&self, other: &Self) -> bool {
        self.area() > other.area()
    }
}
```

interface 可以作为函数的参数的类型，例如：

```ts
function print_area(shape: HasArea) {
    console.log(`This shape has an area of ${shape.area()}`);
}
const circle1 = new Circle(1, 1, 10);
print_area(circle1);
```

而 rust 中的 trait 目前则不能这样做，不过可以通过增加泛型来达到目的，例如：

```rust
fn print_area<T: HasArea>(shape: T) {
    println!("This shape has an area of {}", shape.area());
}
let circle1 = Circle {
    x: 1f64,
    y: 1f64,
    radius: 10f64,
};
print_area(circle1);
```

因为 rust 中的这种限制，一般面向接口编程时，会使用大量的泛型，这也是为什么一般的 rust 代码中，出现泛型漫天飞的原因。

rust 的 trait 可以有不同的调用方式：

```rust
let circle = Circle {
    x: 0f64,
    y: 0f64,
    radius: 10f64,
};
circle.area(); // 普通函数调用
HasArea::area(&circle); // 从 trait 开始的函数调用
```
