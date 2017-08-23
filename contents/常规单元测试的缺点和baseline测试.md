### 常规单元测试的缺点

常规单元测试，需要设计多个测试用例（case），并且要提供每个 case 的实际运行结果。

以一个 js 函数为例：

```javascript
function f(n) {
    return 28 * n * n + 37 * n + 2 / n;
}
```

设计测试用例很简单，边边角角的随便写，比如：n=-1,0,1,2,5,10,50,70,100，但要提供这些 case 的实际运行结果就很烦了。

这是缺点 1：获得 case 期望值很麻烦。

如果这些 case 的运行结果都提供了，测试通过。以 mocha 为例：

```javascript
var assert = require("assert");
describe("default", function() {
    describe("#f()", function () {
        it("should work", function () {
            assert.equal(Infinity, f(0));
            assert.equal(67, f(1));
            // ...
        });
    });
});
```

但是，当实际代码变化时，比如函数中的 37 变成 38，涉及到的 case 就会挂掉一大片，失败的 case 都要再计算一遍。

这是缺点 2：case 期望值很难维护。

这些缺点也是单元测试很难普及的原因之一。

下面在单元测试基础上引入 baseline 测试，主要用来解决上述的几个缺点。

### baseline 测试

baseline 测试是 `baseline the correct result`，以 nodejs 中的一个实现为例：

+ baseline.json：是上一次的正确结果集合，要被加入版本管理
+ cases.js：共用的测试用例逻辑
+ test.js：会执行测试用例逻辑，测试结果与 `baseline.json` 里的数据比较，一致时测试通过
+ rebuild.js：会执行测试用例逻辑，并把测试结果保存到 `baseline.json`

主要过程是：

1. 如果已经有了正确的代码，执行 rebuild，按当前代码逻辑重建基准，这时候执行 test 会肯定通过。这就解决了缺点 1，可以自动获得每个 case 的期望值，可以看到每个 case 的结果和自己的期望是否一致。如果不一致，修复代码后再 rebuild。
2. 如果进行了一项重构，执行 test，如果通过，就表示重构成功。这和普通单元测试一样。
3. 如果修改了代码逻辑，执行 rebuild，在 diff 工具里观察 case 的结果和自己的期望是否一致。这就解决了缺点 2，维护 case 的结果更加方便了。

### 如果要用 faker.js

faker.js 每次会生成不一样的数据，如果 baseline 直接依赖这样的数据，每次测试的结果会不一样。

可以把生成的数据保存到 `seeds.json` 文件，然后 baseline 依赖 `seeds.json` 文件里的固定数据，这样每次测试的结果就一样了。

### 这是先有代码，后有测试，和 TDD 冲突？

这是不同的测试方式，可以先用 TDD 开发，完成代码后 rebuild baseline。