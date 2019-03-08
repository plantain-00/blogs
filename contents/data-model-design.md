# 数据模型设计

在实际较复杂的业务中，会需求很多互相引用的情况，例如：

```ts
interface Foo {
    foo: number
    children: Bar[]
}

interface Bar {
    bar: number
    parent: Foo
}
```

如果设计了上面的 model，序列化为文件，或序列化到数据库时，会报循环引用错误；而如果去掉 children 字段，或去掉 parent 字段，使用时又不太方便

另外，模型的方法放在 model 外，还是 model 内（贫血模型和充血模型），也需要作权衡，例如

```ts
// 贫血
interface Foo {
    foo: number
    children: Bar[]
}

function findBar(foo: Foo) {
    return foo.children.find(...)
}

// 充血
class Foo {
    foo: number
    children: Bar[]

    findBar(foo: Foo) {
        return this.foo.children.find(...)
    }
}
```

## 易于序列化以方便存储和传输的贫血模型

+ 没有循环引用
+ 只使用 number, string, boolean, null, array, object, interface 等容易序列化的数据类型，不使用 Map, class 等
+ 可以定义为 readonly 和 ReadonlyArray，这样执行写操作时，强制通过 data access 层操作
+ 一定要在 interface 和字段上增加相应的文档，因为不管是用于存储，还是用于传输，应用广泛，方便代码阅读
+ 可以使用 types-as-schema 从 model 里的 type 生成 json schema, protobuf 等文件
+ 字段尽量是 optional 的形式，可以减少数据存储和传输大小
+ 新加的字段需要以 optional 的形式添加，因为是协议型的 model，需要一直确保 model 的兼容
+ 如果因为业务需要，model 的含义出现不兼容的改动，可以增加 version 字段，新 model 的 version 是 1，并在将来再次出现不兼容的改动时加一。只读处理 model 时，按照 version 执行相应的逻辑。写处理 model 时（例如用编辑工具打开和保存），对数据进行转换，version 也更新为最新的版本。这样也是为了保证兼容性，类似于新的 Word 打开旧格式的文件。

## 易用、reactive 以方便 UI 操作的充血模型

+ 可以有循环引用、复杂类型
+ mutable
+ reactive（mobx、vuejs）
+ 使用 class，可以加一些业务上紧密相关的 method（method 内可以调用贫血模型的 data access 函数）
+ 负责和充血模型 model 的转换
+ 测试时，测试用例来自贫血模型，转换为充血模型后，执行相应的方法，再转为贫血模型进行测试结果验证
+ 可以收集充血模型里的 computed 结果后进行测试结果验证
