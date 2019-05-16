# Generator 函数的抽象

例如需要遍历一个带复杂业务逻辑的树结构，遍历后的操作由用户决定

首先想到的是 callback

```ts
interface TreeNode {
    children: TreeNode[]
    // other fields
}

function foo(node: TreeNode, callback: (data: any) => void) {
    for (const child of node.children) {
        callback(1) // get some data
        foo(child, callback)
    }
}
```

如果 callback 里有异步操作，需要等异步操作执行成功后，再继续遍历，可以改成 async 函数

```ts
async function foo(node: TreeNode, callback: (data: any) => Promise<void>) {
    for (const child of node.children) {
        await callback(1) // get some data
        foo(child, callback)
    }
}
```

如果也需要能在同步执行环境中被使用，例如 @computed 装饰的函数内，可以使用 generator 函数

```ts
declare const root: TreeNode
declare const request: (data: any) => Promise<any>

const tasks = foo(root)
for(const task of tasks) {
    console.info(task) // 同步执行
}

for(const task of tasks) {
    await request(task) // 逐步异步执行
}

await Promise.all(Array.from(tasks).map((task) => request(task))) // 同时异步执行
```
