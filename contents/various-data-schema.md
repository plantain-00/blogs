# 多种 schema 的维护

在实际开发中，同一个 model 可以有多种 schema，如果后续需要作一些修改，例如增加一个字段，各个 schema 都要改，工作量大，而且容易产生遗漏和错误

## 常见的 schema

### typescript type

用于在开发时规避大部分常见的类型错误。例如：

```ts
interface Foo {
    bar: number
    baz: string
}
```

### json schema

用于对子系统间用来传输的 json 进行运行时验证。例如：

```json
{
    "$ref": "#/definitions/Foo",
    "definitions": {
        "Foo": {
            "type": "object",
            "properties": {
                "bar": {
                    "type": "number"
                },
                "baz": {
                    "type": "string"
                }
            }
        }
    }
}
```

### protobuf schema

用于在子系统间传输二进制数据，相比 json，体积更小，处理更块。例如：

```proto
syntax = "proto3";

message Foo {
    double bar = 1;
    string baz = 2;
}
```

### graphql schema

用于为子系统提供相比 REST API 更灵活的服务。例如：

```graphql
type Foo {
  bar: Float!
  baz: String!
}
```

### swagger 数据 model

用于 REST API 的文档。

### 其它语言的纯数据 model

有些系统需要由多种语言来写。例如 ocaml 类型：

```ocaml
type foo = {
  bar: float;
  baz: string;
}
```

## 常见的方案

一般的优化思路是，只写其中一个 schema，其它 scheme 从这个 schema 自动生成出来

### json schema 和 typescript type 的转换

例如：<https://github.com/YousefED/typescript-json-schema> <https://github.com/bcherny/json-schema-to-typescript>

### 由 apollo graphql 生成 typescript type

例如：<https://github.com/apollographql/apollo-tooling#apollo-clientcodegen-output>

### 由 typescript type 生成其它 schema

例如：<https://github.com/plantain-00/types-as-schema>
