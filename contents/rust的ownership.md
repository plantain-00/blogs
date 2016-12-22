rust中的每个值都有相应并且唯一的owner，和直觉一致的是，在变量绑定时，绑定的变量own了这个值：

```rust
let a = 1; // 1的所有权在a上
let b = vec![1, 2, 3]; // vec![1, 2, 3]的所有权在b上
```

值分为两类，原生类型（例如`1`）和引用类型（例如`vec`），和C#/js中的行为一致，例如：

```rust
let c = a; // 对于原生类型，会复制一份值绑定到c上，这个新产生的1的所有权在c上，原来的1的所有权还在a上
let d = b; // 对于引用类型，不会复制新的一份值绑定到d上
```

直觉上看，通过b和d都可以访问那个rec，然而rust的规则是，**变量绑定和函数调用会发生所有权转移**，所以实际上，那个rec的所有权从b上转移到d上。

根据rust的规则，**拥有值的所有权的变量，才能访问该值**，所以，之后可以通过d访问到那个rec，通过b的话则访问不到那个rec。

```rust
fn take(v: Vec<i32>) { }
let a = vec![1, 2, 3]; // vec的所有权在a上
take(a); // vec的所有权转移到函数take的形参v上
```

**在函数的实参和形参的类型前都加上"&"或"& mut"，可以实现所有权borrow的效果**

```rust
fn take(v: &Vec<i32>) { }
let a = vec![1, 2, 3]; // vec的所有权在a上
take(&a); // vec的所有权被borrow到函数take的形参v上，函数结束后，vec的所有权又被归还给a
```

```rust
fn take(v: &mut Vec<i32>) {
    v[0] = 2; // mut borrow后，可以对vec进行修改
}
let mut a = vec![1, 2, 3];
take(&mut a);
```

**在变量绑定的右侧变强前加"&"，可以同时拥有所有权**

```rust
let a = vec![1, 2, 3]; // vec的所有权在a上
let b = &a; // b也有vec的所有权
```

**在变量绑定的右侧变强前加"& mut"，可以实现所有权borrow的效果**

```rust
let mut a = vec![1, 2, 3]; // vec的所有权在a上
let b = &mut a; // b borrow了vec的所有权，当b的lifetime结束后，所有权被还给a
```

**在函数中返回一个闭包，可以通过"move"来转移所有权**

```rust
fn factory() -> Box<Fn(i32) -> i32> {
    let num = 5;
    Box::new(move |x| x + num) // 依赖函数中的局部变量num，通过move拿到num的所有权，这样在函数外就可以使用num了
}
```
