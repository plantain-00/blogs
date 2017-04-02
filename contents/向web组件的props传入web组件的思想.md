以函数为类比，函数的参数也可以是函数，典型的例子就是数组的map/filter方法。

#### vuejs的例子

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

#### reactjs的例子

再以reactjs的组件为例，先设计一个组件，props有child(string, 子组件类))、elements(string[], 列表数据)，要求子组件可以接收一个名为name的props：

```ts
class MyList extends React.Component<{ elements: string[]; child: React.ComponentClass<{ name: string }> }, {}>{
    render() {
        return (
            <div>
                {this.props.elements.map(e => React.createElement(this.props.child, { name: e }))}
            </div >
        );
    }
}
```

调用这个组件前，需要先定义子组件，类似于函数的实参，这里分别定义两个子组件（实参）：

```ts
class MyElement1 extends React.Component<{ name: string }, {}>{
    render() {
        return (
            <button>{this.props.name}</button>
        );
    }
}
class MyElement2 extends React.Component<{ name: string }, {}>{
    render() {
        return (
            <span>{this.props.name}</span>
        );
    }
}
```

然后就像函数的传参那样分别调用一下：

```ts
class Main extends React.Component<{}, {}>{
    elements = ["test 1", "test 2"];
    render() {
        return (
            <div>
                <MyList elements={this.elements} child={MyElement1}></MyList>
                <MyList elements={this.elements} child={MyElement2}></MyList>
            </div >
        );
    }
}
ReactDOM.render(<Main />, document.getElementById("container"));
```

最后生成的html代码是：

```html
<div id="container">
    <div data-reactroot="">
        <div>
            <button>test 1</button>
            <button>test 2</button>
        </div>
        <div>
            <span>test 1</span>
            <span>test 2</span>
        </div>
    </div>
</div>
```

#### angular的例子

再以angular的组件为例，先设计一个组件，props有child(子组件类)、elements(string[], 列表数据)，要求子组件可以接收一个名为name的props：

```ts
@Component({
    selector: "my-list",
    template: `
    <div>
        <ng-template #children>
        </ng-template>
    </div>
    `,
})
class MyListComponent {
    @Input()
    child: any;
    @Input()
    elements: string[];

    @ViewChild("children", { read: ViewContainerRef })
    children: ViewContainerRef;

    ngOnInit() {
        const resolver: ComponentFactoryResolver = this.children.injector.get(ComponentFactoryResolver);
        const factory = resolver.resolveComponentFactory<{ name: string }>(this.child);
        for (let i = 0; i < this.elements.length; i++) {
            const component = this.children.createComponent<{ name: string }>(factory, i);
            component.instance.name = this.elements[i];
        }
    }
}
```

调用这个组件前，需要先定义子组件，类似于函数的实参，这里分别定义两个子组件（实参）：

```ts
@Component({
    selector: "my-element-1",
    template: `<button>{{name}}</button>`,
})
class MyElement1Component {
    @Input()
    name: string;
}

@Component({
    selector: "my-element-2",
    template: `<span>{{name}}</span>`,
})
class MyElement2Component {
    @Input()
    name: string;
}
```

然后就像函数的传参那样分别调用一下：

```ts
@Component({
    selector: "app",
    template: `
    <my-list [child]="MyElement1Component" [elements]="elements"></my-list>
    <my-list [child]="MyElement2Component" [elements]="elements"></my-list>
    `,
})
export class MainComponent {
    elements = ["test 1", "test 2"];
    MyElement1Component = MyElement1Component;
    MyElement2Component = MyElement2Component;
}
```

最后生成的html代码是：

```html
<app ng-version="4.0.1">
    <my-list>
        <div>
            <my-element-1 ng-version="4.0.1">
                <button>test 1</button>
            </my-element-1>
            <my-element-1 ng-version="4.0.1">
                <button>test 2</button>
            </my-element-1>
        </div>
    </my-list>
    <my-list>
        <div>
            <my-element-2 ng-version="4.0.1">
                <span>test 1</span>
            </my-element-2>
            <my-element-2 ng-version="4.0.1">
                <span>test 2</span>
            </my-element-2>
        </div>
    </my-list>
</app>
```

注意需要MainModule的entryComponents中声明子组件：

```ts
@NgModule({
    entryComponents: [MyElement1Component, MyElement2Component],
})
class MainModule { }
```
