map/reduce/filter的概念来自函数式编程，是针对集合的操作，用于表示映射、聚合、过滤。

有一种数据处理模型以此命名，称为MapReduce。

而在具体的软件开发中，这三个概念被分别抽象出三个函数，而具体通过什么方式来映射、聚合、过滤，则由调用者来决定。

如果要实现这样的效果，需要`函数作为参数传递`，传统的过程式编程和OO都没有办法，而函数式编程，或者说是带有函数式编程的多范式语言就可以做到。

js就是其中之一，以调用者的角度来看：

```js
const books = [
    { name: "a", pages: 10 },
    { name: "b", pages: 20 },
    { name: "c", pages: 30 },
];

const filteredBooks = books.filter(function(book) {
    return book.pages > 12;
});
const mappedBooks = filteredBooks.map(function(book) {
    return {
        name: book.name,
        pages: book.pages / 2,
    };
});
const totalPages = mappedBooks.reduce(function(result, book) {
    return result + book.pages;
}, 0);
```

如果引入`lambda表达式`，使用时变得更加简洁，代码可以写成：

```js
const filteredBooks = books.filter(book => book.pages > 12);
const mappedBooks = filteredBooks.map(book => {
    return {
        name: book.name,
        pages: book.pages / 2,
    };
});
const totalPages = mappedBooks.reduce((result, book) => result + book.pages, 0);
```

甚至可以有链式的写法，例如：

```js
const totalPages = books
    .filter(book => book.pages > 12)
    .map(book => {
        return {
            name: book.name,
            pages: book.pages / 2,
        };
    })
    .reduce((result, book) => result + book.pages, 0);
```

从实现者的角度看，不考虑参数验证的话，类似于：

```ts
function filter<T>(array: T[], func: (t: T) => boolean): T[] {
    let result: T[] = [];
    for (const t of array) {
        if (func(t)) {
            result.push(t);
        }
    }
    return result;
}

function map<T, U>(array: T[], func: (t: T) => U): U[] {
    let result: U[] = [];
    for (const t of array) {
        result.push(func(t));
    }
    return result;
}

function reduce<T, U>(array: T[], func: (u: U, t: T) => U, u0: U): U {
    for (const t of array) {
        u0 = func(u0, t);
    }
    return u0;
}
```

python中也有类似的模式：

```py
print map(lambda x: x * x, [1, 2, 3])
print reduce(lambda x, y: x + y * y, [1, 2, 3], 10)
print filter(lambda x: x > 1, [1, 2, 3])
```

C#中也有类似的模式：

```csharp
var books = new[] {
    new{ Name = "a", Pages = 10 },
    new{ Name = "b", Pages = 20 },
    new{ Name = "c", Pages = 30 },
};
var totalPages = books
    .Where(book => book.Pages > 12)
    .Select(book =>
    {
        return new
        {
            Name = book.Name,
            Pages = book.Pages / 2,
        };
    })
    .Aggregate(0, (result, book) => result + book.Pages);
```

这里的实现特色是，并不是逐步执行、上一步的结果作为下一步的参数的，而是延迟执行的，只会计算一次，而不是三次。这是LINQ的一个特色，可以提高性能。

C++11中也有类似的模式：

```C++
#include <vector>
#include <algorithm>
#include <numeric>

using namespace std;

void main() {
	vector<int> vec{ 1, 2, 3 };
	transform(vec.begin(), vec.end(), vec.begin(), [](int i) { return i * i; });
	auto it = remove_if(vec.begin(), vec.end(), [](int i) { return i > 1; });
	accumulate(vec.begin(), vec.end(), 1, [](int a, int b) { return a * b; });
}
```

ruby中也有类似的模式：

```ruby
nums = [1,2,3,4,5]
result = nums.map{|x| x * x}.select{|x| x % 2 == 0}.reduce{|a, x| a + x}
p result
```

swift中也有类似的模式：

```swift
var a = [1,2,3,4].map{ $0 * $0 }.filter{ $0 > 1 }.reduce(0) { $0 + $1 }
print(a)
```

scala中也有类似的模式：

```scala
val a = (1 to 5).map(x => x * x).filter(x => x > 1).reduceLeft(_ + _)
println(a)
```

rust中也有类似的模式：

```rust
let a = [1, 2, 3, 4, 5].iter().map(|x| x * x).filter(|x| x % 2 == 0).fold(0, |acc, x| acc + x);
println!("{}", a);
```

不过，C、Java、Go却没有相关的用法。
