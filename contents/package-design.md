# package 的设计

## package 的常见使用场景

+ web 前端 webpack 打包
+ web 前端 `<script>` 引用
+ nodejs 后端

因为需要输出多个格式(ES module, commonjs, umd)

ES module, commonjs 的输出可以通过 typescript /  babel 转换而来

umd 的输出可以通过 rollup 打包而来

## package 的组织结构

如果多个 package 之间有依赖关系，采用 monorepo 的方式，更方便管理

## package.json

+ main 字段：通过 `require('foo')` 的方式实际就是导入 main 字段所在的文件
+ module 字段：通过 `import ... from 'foo'` 的方式实际就是导入 module 字段所在的文件
+ types 或 typings 字段：typescript 声明文件位置
+ files 字段：指定的多个文件才回被 publish 出去(`package.json` `README.md` `LICENSE` 不需要指定)，避免 publish test 和 scripts 等文件，以免 package 太大
+ unpkg 和 jsdelivr 字段：发布的 umd 文件，相应的 cdn provider 会依赖这个来确定提供那个 js 文件 script
