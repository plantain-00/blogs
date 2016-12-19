一般是抽象于一种能力，内部包含一个或多个函数，然后会有class来实现它，从而该class就拥有这种能力。

在java/C#/typescript中被称为interface，在rust/scala中被称为trait。

下面是一个interface的例子：

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

下面是rust中的trait的例子：

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

interface可以作为函数的参数的类型，例如：

```ts
function print_area(shape: HasArea) {
    console.log(`This shape has an area of ${shape.area()}`);
}
const circle1 = new Circle(1, 1, 10);
print_area(circle1);
```

而rust中的trait目前则不能这样做，不过可以通过增加泛型来达到目的，例如：

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

因为rust中的这种限制，一般面向接口编程时，会使用大量的泛型，这也是为什么一般的rust代码中，出现泛型漫天飞的原因。
