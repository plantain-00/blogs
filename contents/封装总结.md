#### function：对行为的封装

```ts
// callee
function increase(count: number) {
    return a + 1;
}

// caller
const count1 = increase(10);
console.log(count1);

const count2 = increase(20);
console.log(count2);
```

这种方式，函数内部应该只依赖函数的参数，应该是无状态的。

如果有状态，应该用 class 的方式封装状态，避免全局状态的污染。

#### class：对状态和行为的封装

```ts
// callee
class Counter {
    constructor(public count = 0) { }
    increase() {
        this.count++;
    }
}

// caller
const counter1 = new Counter(10);
counter1.increase();
console.log(counter1.count);

const counter2 = new Counter(20);
counter2.increase();
counter2.increase();
console.log(counter2.count);
```

这种方式，不同 instances 之间的状态不会相互影响。

像 UI 组件那样，如果对状态和行为的封装仍然不够，还需要指定模板，再预编译成模板函数，可以考虑通过加 decorator 的方式，增加额外的信息。

#### decorator：再封装其它信息

```ts
// callee
function Component(component: { template: string }): ClassDecorator {
    return (target: any) => {
        target.__render = function (instance: any) {
            console.log(instance.__props); //  `__props` array can be used in compilation
            return `<span>${instance.count}</span>`; // should be compiled from `component.template` string
        };
    };
};

function Input(): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        if (!target.__props) {
            target.__props = [];
        }
        target.__props.push(propertyKey);
    }
}

// caller
@Component({
    template: `<span>{{count}}</span>`,
})
class Counter1 {
    constructor(public count = 0) { }
    increase() {
        this.count++;
    }
}

const counter1 = new Counter1(10);
counter1.increase();
console.log((Counter1 as any).__render(counter1));

@Component({
    template: `<button>{{count}}</button>`,
})
class Counter2 {
    constructor(public count = 0) { }
    increase() {
        this.count++;
    }

    @Input()
    prop1: number;
    @Input()
    prop2: string;
}

const counter2 = new Counter2(10);
counter2.increase();
counter2.increase();
console.log((Counter2 as any).__render(counter2));
```
