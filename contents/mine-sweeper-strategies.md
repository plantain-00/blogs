# 扫雷游戏的策略

```
  2 1
1 1 0
0 0 0 
```

以上面的例子为例，按照中间的 1，可以推断左上角是一个雷

抽象出具体规则是：

```js
const mineCount = 1; // 周围的雷的数量
const flaggedCount = 0; // 周围的旗帜的数量
const unknownCount = 1; // 周围的未确认的位置数量
const unknownMineCount = mineCount - flaggedCount; // 周围未确认的的雷的数量 = 1
if (unknownMineCount === 0) {
    // 周围的未确认位置都不是雷，可以挖
} else if (unknownMineCount === unknownCount) {
    // 周围的未确认位置都是雷，可以插旗
} else {
    // 没有结论
}
```

```
F 2 0 |
2 2 1 |
      |
-------
```

以上面的例子为例，按照其中的 1，可以推断下面的后 2 个未确认位置中有 1 个雷；按照最中间的 2，可以推断下面的 3 个未确认位置中有 1 个雷。

根据上面的 2 个条件，可以推断最左边的那个未确认位置不含雷，可以挖

抽象出具体规则是：

```
// 定义三个未确认位置，从左到右分别是 A、B、C
const condition1 = {
    positions: [A, B, C], // 未确认位置
    mineCount: 1, // 上面几个未确认位置中，所含雷的个数
};
const condition2 = {
    positions: [B, C], // 未确认位置
    mineCount: 1, // 上面几个未确认位置中，所含雷的个数
};
// 确认 condition1.positions 完全包含了 condition2.positions
const mineCount = condition1.mineCount - condition2.mineCount; // 雷的数量差 = 0
const unknownCount = condition1.positions.length - condition2.positions.length; // 未确认位置的数量差 = 1
if (mineCount === 0) {
    const positions = condition1.positions.filter(p1 => condition2.positions.every(p2 => p1 !== p2)); // 计算未确认位置的差值集合 = [C]
    // 上述差值集合都不是雷，可以挖
} else if (mineCount === unknownCount) {
    const positions = condition1.positions.filter(p1 => condition2.positions.every(p2 => p1 !== p2)); // 计算未确认位置的差值集合 = [C]
    // 上述差值集合都是雷，可以插旗
} else {
    // 没有结论
}
```
