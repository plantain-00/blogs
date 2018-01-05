# 使用 vuejs 实例而非 vuex 作为 store

## vuex 的缺点

+ 概念不必要地复杂，例如要区分 mutation 和 action
+ 把 mutation 和 action 的名字字符串作为参数来 commit 和 dispatch，难以进行类型验证

## 原理

vuejs 和 mobx 的响应系统很类似，既然 mobx 用来做 store，vuejs 也可以

## 基本示例

```ts
import Vue = require("vue");
import Component from "vue-class-component";

@Component
class AppState extends Vue {
    count = 0; // state 写为类字段

    increase() { // mutation 和 action 不区分，都写为类方法，如果是异步的，建议返回 Promise
        this.count++;
    }
}
```

## 创建 store 实例

```ts
const appState = new AppState(); // 创建实例

appState.count = 100; // 设置初始状态
```

## 序列化 store 实例

```ts
JSON.stringify(appState.$data);
```

## 以 props 的形式绑定 store 实例

```ts
const router = new VueRouter({
    mode: "history",
    routes: [
        { path: "/", component: Home, props: { appState } }, // 在 router 中设置 appState props
    ],
});

@Component({
    template: `...`,
    props: ["appState"], // 组件中也要做 props 声明
})
class Home extends Vue {
    // ...
    appState: AppState; // 组件中设置一个相应的字段，就可以通过 `this.appState` 访问到这个 store
    // ...
}
```
