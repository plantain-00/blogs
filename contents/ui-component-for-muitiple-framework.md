# 支持多个框架的 UI 组件设计

如果一个 UI 组件可以被用户以 react, vue, angular 的方式使用，组件的易用性更好

## 原则

+ UI 一致
+ 操作行为一致
+ 组件的 props 一致

## 实现方式

+ 四个 package(`foo-core` `vue-foo` `react-foo` `angular-foo`)，放在一个 monorepo 仓库中
+ 三个 ui package：负责用各个 framework 实现 UI 部分
+ 一个 core package：负责组件的核心和公有的逻辑，例如数据处理、事件处理等
+ ui package 依赖 core package，用户只需要 import 需要的 ui package 即可

## 组件的 css

### css-in-js

目前的 css-in-js 方案都依赖 framework，而且不能指望用户也使用 css-in-js 方案（package 的 css-in-js 方案和 用户的 css-in-js 方案都不一定一致），所以弃用  css-in-js 方案

### import css

依赖用户使用 webpack 等打包工具的 css-loader 来加载 css，所以弃用

### less/scss -> postcss -> css -> bundle/minify

传统的 css 分开处理的方式，用户可以根据需要 import 发布出的 css，或作为 css 文件的方式被使用

这也是最灵活的方式
