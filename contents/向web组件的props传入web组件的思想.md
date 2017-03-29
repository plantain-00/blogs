以函数为类比，函数的参数也可以是函数，典型的例子就是数组的map/filter方法。

以vuejs的组件为例，先设计一个组件，props有child(string, 子组件名))、elements(string[], 列表数据)，要求子组件可以接收一个名为name的props：

```ts
Vue.component("my-list", {
    template: `
    <div>
        <component :is='child'
            v-for='element in elements'
            :name='element'>
        </component>
    </div>
    `,
    props: ["child", "elements"],
});
```

调用这个组件前，需要先定义子组件，类似于函数的实参，这里分别定义两个子组件（实参）：

```ts
Vue.component("my-element-1", {
    template: "<button>{{name}}</button>",
    props: ["name"]
});
Vue.component("my-element-2", {
    template: "<span>{{name}}</span>",
    props: ["name"]
});
```

然后就像函数的传参那样分别调用一下：

```html
<div id="app">
    <my-list child="my-element-1" :elements="elements"></my-list>
    <my-list child="my-element-2" :elements="elements"></my-list>
</div>
```

```ts
new Vue({
    el: '#app',
    data: {
            elements: ["test 1", "test 2"]
    }
});
```

最后生成的html代码是：

```html
<div id="app">
    <div>
        <button>test 1</button>
        <button>test 2</button>
    </div>
    <div>
        <span>test 1</span>
        <span>test 2</span>
    </div>
</div>
```
