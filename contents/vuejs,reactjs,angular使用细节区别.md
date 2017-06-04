#### 字段初始值

vuejs的字段的初始值不能为`undefined`，否则不会被`defineProperty`

#### props

reactjs的props要通过`this.props.foo`来取，其它框架只需要通过`this.foo`来取

reactjs的props是readonly的，如果props只是初始值，可以通过增加一个state来解决，在`componentWillMount`hook中把这个初始值赋给那个state

reactjs的props需要在`React.Component<P, S>`的`P`类型中声明

vuejs的props需要在class中以字段的形式定义，并在class decorator中的`props`字段中声明

angular的props需要需要在class中以字段的形式定义，还需要加`@Input()`的decorator

#### state

state需要在class中以字段的形式定义

reactjs设置state后需要调用一次`this.setState({ foo: this.foo });`，其它框架则不需要

#### className

reactjs jsx声明的className应该是`className="foo"`的形式

#### 组件的事件

vuejs通过`this.$emit("foo", 123);`来触发事件

reactjs需要在props中声明事件`foo: (value: number) => void;`，再通过`this.props.foo(123);`来触发事件

angular需要声明相应的字段`@Output() foo = new EventEmitter();`，再通过`this.foo.emit(123);`来触发事件

对于原生事件，vuejs和angular的事件名形式为`blur`，而reactjs为`onBlur`

#### 事件的参数

类别 | vuejs | reactjs | angular
--- | --- | --- | ---
原生事件 | $event | | $event
组件的自定义事件 | arguments[0] | | $event

对于原生事件，vuejs和angular的参数类型类似于`KeyboardEvent`，而reactjs的参数类型则类似于`React.KeyboardEvent<HTMLInputElement>`

#### 生命周期钩子

vuejs | reactjs | angular
--- | --- | ---
beforeMount | componentWillMount | ngOnInit
mounted | componentDidMount | ngAfterViewInit
beforeDestroy | componentWillUnmount | ngOnDestroy

#### 模板声明

vuejs和angular通过class decorator中的`template`字段中声明，而reactjs需要在`render` hook中声明

#### 双向绑定

vuejs有`v-model`，angular有`ngModel`，reactjs则没有默认保含双向绑定，不过可以通过绑定`value`和`onChange`事件来达到同样的效果

#### 条件和循环

vuejs | reactjs | angular
--- | --- | ---
v-if="isValid" | const element = this.isValid ? <span></span> : null | *ngIf="isValid"
v-else | const element = this.isValid ? null : <span></span> | *ngIf="!isValid"
v-for="(item, i) in items" | const elements = this.items.map((item, i)=> <span></span>) | *ngFor="let item of items; let i = index"

#### 绑定props和事件

vuejs | reactjs | angular
--- | --- | ---
:foo="foo" | foo={ this.foo } | [foo]="foo"
@bar="bar()" | bar={ e => this.bar() } | (bar)="bar"

对于非标准的属性，angular可以使用`[attr.foo]="foo"`来实现

如果vuejs组件的属性名和事件名是`fooBar`的形式，在声明`props`的时候，应该使用`fooBar`的形式，但是下列情况下，应该使用`foo-bar`的形式 :

1. `this.$emit("foo-bar", 123);`
2. `:foo-bar="baz"`
3. `@foo-bar="baz()"`

#### 获取原生HTMLElement

vuejs可以在模板中定义`ref="foo"`，再在相应的生命周期钩子中取得`this.$refs.foo as HTMLElement`

reactjs可以在相应的生命周期钩子取得`ReactDOM.findDOMNode(this).childNodes[0].childNodes[1] as HTMLElement`取得

angular可以在模板中定义`#foo`，然后在class中声明`@ViewChild("foo") foo: ElementRef;`，最后在相应的生命周期钩子中取得`this.searchInput.nativeElement as HTMLElement`

#### nextTick

vuejs可以通过`Vue.nextTick(() => { // todo });`来实现

reactjs可以通过`this.setState({ foo: this.foo }, () => { // todo });`来实现

#### 空元素

vuej使用`<template></template>`

angular使用`<ng-container></ng-container>`
