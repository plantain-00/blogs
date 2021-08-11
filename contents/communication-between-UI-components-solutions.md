# UI组件间通信的几个解决方案

组件间通信，如果采用父子组件传递 props 的方式，需要通过它们的公共父节点逐层传递 props，非常麻烦，同时也会污染传递链上的组件接口

常见的解决方案有：

### data store

定义一个全局的 store，把各个组件的 state 都移到这个定义的 store state 中，各个组件依赖全局 store 中的 state 来渲染页面，通过触发 store 中定义的 mutation 或 action 来修改 store 中的 state。

因为 state 和 state 的修改都集中在 store 中，组件间的通信问题也就消失了

```js
const store = new Vuex.Store({
    state: {
        blogs: []
    },
    mutations: {
        addBlog(state, payload) {
            state.blogs.push(payload.blog);
        }
    }
});

// const blogs = this.$store.state.blogs;
// this.$store.commit("addBlog", { blog: "abc" });
```

```js
class AppState {
    @observable
    blogs = [];

    @action
    addBlog(payload) {
        this.blogs.push(payload.blog);
    }
}
const appState = new AppState();
// const blogs = this.props.appState.blogs;
// this.props.appState.addBlog({ blog: "abc" });
```

缺点：

+ 破坏了组件对 state 的封装，组件的 state 在公共的 store 中，其它组件能够随意修改，容易产生 BUG
+ 不能应用类型检查，例如 vuex 中 commit 的 mutation 是字符串形式，定义的 mutation 是函数形式，类型不匹配

### 自定义事件

定义一个全局的 html element 作为事件的载体，消息接收组件 mounted 后监听事件并处理获得的数据，消息发送组件通过 dispatchEvent 方法发送数据

```js
const catEventHost = document.createElement("div");

catEventHost.addEventListener("cat", e => {
    console.log(e.detail);
});

catEventHost.dispatchEvent(new CustomEvent("cat", {
    detail: "hello world!"
}));
```

缺点：

+ 是一个 hack 方法，不直观
+ 对于不支持 CustomEvent API 的浏览器，需要引入 polyfill 库

### rxjs 的 Subject

定义一个全局的 Subject 对象，消息接收组件 mounted 后 subscribe 这个 Subject 并处理获得的数据，消息发送组件通过 next 方法发送数据

```js
import { Subject } from "rxjs/Subject";
const catSubject = new Subject();

catSubject.subscribe(message => {
    console.log(message);
});

catSubject.next("hello world!");
```

### 考虑组件的可复用性

当组件像上面所说的，依赖全局的 data store、全局的事件载体、rxjs 库来实现组件间交互，会降低组件的可复用性，这种情况下把组件状态分散在各个组件中更好一些，对于要长期维护的树状组件库，逐层传递 props 的复杂性可以接受。

下面总结一下几种组件间交互的场景：

#### 父组件决定子组件的状态

例如，一般 tooltip 设计为鼠标移开提示框和触发提示的元素时隐藏提示框，提示框是否显示的状态在 tooltip 组件内部，但在数字滑动输入组件中，要求拖动滑块时，即使拖动快到触发了 mouseleave 事件，滑块也要一直提示当前数值。

```tsx
function Tooltip(props: {
    visible?: boolean
}) {
    const [visible, setVisible] = React.useState(false)
    // 从父组件传入的 visible 为 boolean 时强制一致提示或不提示，为 undefined 时由组件内部状态来决定
    const actualVisible = typeof props.visible === 'boolean' ? props.visible : visible
}
```

#### 父组件改变一次子组件的状态

例如，一般可折叠的面板是否折叠的状态在组件内部，但对于“全部折叠”功能，可以把当前的若干个面板全部折叠一下，各个面板仍然可以展开。

```tsx
function Panel(props: {
    foldedTrigger?: { value: boolean }
}) {
    const [folded, setFolded] = React.useState(false)
    // 收到 trigger 时更新一下状态
    React.useEffect(() => {
        if (props.foldedTrigger) {
            setFolded(props.foldedTrigger.value)
        }
    }, [props.foldedTrigger])
}

function App() {
    const [foldedTrigger, setFoldedTrigger] = React.useState<{ value: boolean }>()
    return (
        <>
          <Panel foldedTrigger={foldedTrigger} />
          <button onClick={() => {
              // 触发更新，直接使用 true 的话，第二次“全部折叠”时触发不了组件更新
              setFoldedTrigger({
                value: true,
              })
          }}>全部折叠</button>
        </>
    )
}
```
