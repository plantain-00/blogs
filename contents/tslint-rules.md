# tslint 规则相关

### 原则：

1. 尽量严格
2. 尽量不与已经明晰的代码冲突
3. 如果个别情况下会与已经明晰的代码冲突，仍然可以采用此规则，冲突时利用注释，在此行或某一区域禁用此规则即可

### 几个弊大于利的规则：

#### 1. max-line-length

为了提高代码可读性，默认每行不超过 120 字符。

如果要求命名清晰，命名就很可能会长，即使很清晰的代码，也很容易就超出了规定的长度；

长度超出后，在什么地方换行也没有统一的最佳实践，容易引起分歧。

#### 2. ordered-imports

为了减少代码冲突的概率，import 语句按字母顺序排序。

某些 import 的顺序会存在依赖，改变顺序后，可能引起报错；

改变顺序后，一部分联系紧密的代码块就不容易放置在一起。

#### 3. object-literal-sort-keys

为了减少代码冲突的概率，object 字面量的 key 按字母顺序排序。

key 的顺序可能会与文档中的顺序一致，如果强制按字母顺序排序，维护代码和文档会变困难。

#### 4. member-access

为了明确 class 中成员的可访问性，强制增加 public/private 等限制关键词。

大部分成员都是 public，如果都写上，会增加大量的文字量，而且不够简洁。

#### 5. arrow-parens

为了和多参数、零参数的 arrow 函数的形式保持一致，强制在单参数外加上括号。

强制后，不再如 `const c = a => b => a + b;` 一般简洁。

#### 6. array-type

对于数组类型，简单数组使用 `T[]` 的形式，复杂数组使用 `Array<T>` 的形式。

`T[]` 的形式要比 `Array<T>` 简洁，所以全部使用 `T[]` 的形式更好一些。

#### 7. max-classes-per-file

为了保证单一职责，默认每个文件内都应该只有一个 class。

文件对应模块，应该由模块来决定职责，而不是 class，class 适合用于封装一些数据和行为，不适合像 java 那样大量使用。

#### 8. interface-over-type-literal

更倾向使用 interface 而不是 type。用 type 来表示类型，语义上更直观。