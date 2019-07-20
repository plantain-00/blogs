# 保证接口兼容性的策略

## 新增字段

新增的字段需要是 `optional` 的

```ts
interface Foo {
  bar: number
}

interface Foo {
  bar: number
  baz?: string // <- 新增的字段
}
```

## 字段命名

已有的字段不要改名字，而是通过注释的方式解释实际的含义

```ts
interface Foo {
  bar: number
}

interface Foo {
  /**
   * 红色 bar
   */
  bar: number
  /**
   * 绿色 bar
   */
  greenBar: string
}
```

## 函数新增参数

函数新增的参数需要是 `optional` 的

```ts
function foo(bar: number) {}

function foo(bar: number, baz?: string) {}
```

但不要有多个 `optional` 的参数，需要转换为 `options` 字段

```ts
function foo(bar: number, baz?: string) {}

function foo(bar: number, options?: string | Partial<Options>) {
  options = getOptions(options)
}

interface Options {
  baz: string
  qux: number
}

function getOptions(options?: string | Partial<Options>): Partial<Options> {
  if (options) {
    if (typeof options === 'string') {
      return {
        baz: options
      }
    }
    return options
  }
  return {}
}
```

## 函数返回值增加字段

如果函数的返回值不是 object，比较 dirty 的方式是，通过增加 optional 参数 callback 的方式返回新字段

```ts
function foo() {
  return 1
}

function foo(getBar?: () => string) {
  if (getBar) {
    getBar('bar')
  }
  return 1
}
```

最理想的方式，还是函数一开始就返回 object

```ts
function foo() {
  return {
    foo: 1
  }
}

function foo() {
  return {
    foo: 1,
    bar: 'bar' // 注意这里不需要是 optional 的
  }
}
```

## 函数参数的 callback 函数增加参数

这时不需要设为 optional 就可以保证兼容

```ts
function foo(bar: (baz: number) => void) {}

function foo(bar: (baz: number, qux: string) => void) {}
```

## 新增 union 类型

```ts
interface Foo {
  bar: number
}

type Foo = Bar | Baz

interface Bar {
  type: undefined
  bar: number
}

interface Baz {
  type: 'baz'
  baz: string
}
```
