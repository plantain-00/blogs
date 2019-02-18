# 复杂 package 的几种实现方式

这里说的复杂 package，是指 package 的实现不是存粹的计算，还依赖于运行环境的功能，例如浏览器中的 dom, canvas, nodejs 中的 fs 操作能力，类似于病毒（复杂 package）和宿主（runtime）的关系

为了让 package 的使用范围更广，package 常常期望可以运行在多种不同的运行环境中，例如浏览器，nodejs，小程序，react-native 等等

对于复杂 package，为了可以运行在多种不同的运行环境中，可以按下面的几种方式来实现

## 宿主检测

通过运行时检测或特性检测的方式，不同的宿主运行不同的代码

```ts
if (浏览器环境) {
    window.fetch()
} else if (nodejs 环境) {
    require('node-fetch')
}
```

```ts
if (nodejs 环境) {
    手动计算 blur，因为 node-canvas 不支持 filter
} else if (浏览器环境) {
    ctx.filter = 'blur(5px)'
}
```

+ 优点：实现简单
+ 缺点：但需要增加新的运行环境支持时，代码改动较大

## 宿主模拟

这种方式需要抽象出依赖的宿主功能接口，package 再针对这个接口编程

而各个宿主，都要实现这个接口

```ts
interface Host {
    getData(url: string): Promise<any>
}

export function foo(host: Host) {
    host.getData('')
}

// nodejs 环境
import fetch = require('node-fetch')
const host1: Host = {
  getData: (url: string) => fetch(url)
}
foo(host1)

// 浏览器环境
const host2: Host = {
  getData: (url: string) => window.fetch(url)
}
foo(host2)
```

另一个实际的例子是 typescript API，它需要 fs 功能以读取代码文件，但如果在无 fs 的环境，例如浏览器中，通过网络请求实现了 host 接口，typescript 也就可以在浏览器中运行了

+ 优点：实现复杂，需要一个抽象的宿主接口，和多个实现
+ 缺点：需要增加新的运行环境支持时，不需要改已有的代码
