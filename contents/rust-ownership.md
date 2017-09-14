# rust 的 ownership

rust 中的每个值都有相应并且唯一的 owner，和直觉一致的是，在变量绑定时，绑定的变量 own 了这个值：

```rust
let a = 1; // 1 的所有权在 a 上
let b = vec![1, 2, 3]; // vec![1, 2, 3] 的所有权在 b 上
```

值分为两类，原生类型（例如 `1`）和引用类型（例如 `vec`），和 C#/js 中的行为一致，例如：

```rust
let c = a; // 对于原生类型，会复制一份值绑定到 c 上，这个新产生的 1 的所有权在 c 上，原来的 1 的所有权还在 a 上
let d = b; // 对于引用类型，不会复制新的一份值绑定到 d 上
```

直觉上看，通过 b 和 d 都可以访问那个 rec，然而 rust 的规则是，** 变量绑定和函数调用会发生所有权转移 **，所以实际上，那个 rec 的所有权从 b 上转移到 d 上。

根据 rust 的规则，** 拥有值的所有权的变量，才能访问该值 **，所以，之后可以通过 d 访问到那个 rec，通过 b 的话则访问不到那个 rec。

```rust
fn take(v: Vec<i32>) { }
let a = vec![1, 2, 3]; // vec 的所有权在 a 上
take(a); // vec 的所有权转移到函数 take 的形参 v 上
```

** 在函数的实参和形参的类型前都加上 "&" 或 "& mut"，可以实现所有权 borrow 的效果 **

```rust
fn take(v: &Vec<i32>) { }
let a = vec![1, 2, 3]; // vec 的所有权在 a 上
take(&a); // vec 的所有权被 borrow 到函数 take 的形参 v 上，函数结束后，vec 的所有权又被归还给 a
```

```rust
fn take(v: &mut Vec<i32>) {
    v[0] = 2; // mut borrow 后，可以对 vec 进行修改
}
let mut a = vec![1, 2, 3];
take(&mut a);
```

** 在变量绑定的右侧变强前加 "&"，可以同时拥有所有权 **

```rust
let a = vec![1, 2, 3]; // vec 的所有权在 a 上
let b = &a; // b 也有 vec 的所有权
```

** 在变量绑定的右侧变强前加 "& mut"，可以实现所有权 borrow 的效果 **

```rust
let mut a = vec![1, 2, 3]; // vec 的所有权在 a 上
let b = &mut a; // b borrow 了 vec 的所有权，当 b 的 lifetime 结束后，所有权被还给 a
```

** 在函数中返回一个闭包，可以通过 "move" 来转移所有权 **

```rust
fn factory() -> Box<Fn(i32) -> i32> {
    let num = 5;
    Box::new(move |x| x + num) // 依赖函数中的局部变量 num，通过 move 拿到 num 的所有权，这样在函数外就可以使用 num 了
}
```
