# 类型安全的物理量抽象

### 物理量单位的抽象

物理量单位由七种基本单位和导出单位组成，可以抽象为：m^x1 * kg ^ x2 * ... * cd ^ x7, 其中，x1...x7 是有理数。

考虑到类型安全，使用泛型来定义物理量单位的类型。

```ts
class Unit<
    Tm extends number,
    Tkg extends number,
    Ts extends number,
    TA extends number,
    TK extends number,
    Tmol extends number,
    Tcd extends number> {
    constructor(
        public m: Tm,
        public kg: Tkg,
        public s: Ts,
        public a: TA,
        public k: TK,
        public mol: Tmol,
        public cd: Tcd,
        public times = 1) { }
    multiple<
        Vm extends number,
        Vkg extends number,
        Vs extends number,
        VA extends number,
        VK extends number,
        Vmol extends number,
        Vcd extends number>(unit: Unit<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>) {
        return new Unit((this.m as number) + (unit.m as number),
            (this.kg as number) + (unit.kg as number),
            (this.s as number) + (unit.s as number),
            (this.a as number) + (unit.a as number),
            (this.k as number) + (unit.k as number),
            (this.mol as number) + (unit.mol as number),
            (this.cd as number) + (unit.cd as number),
            this.times * unit.times);
    }
    divide<Vm extends number,
        Vkg extends number,
        Vs extends number,
        VA extends number,
        VK extends number,
        Vmol extends number,
        Vcd extends number>(unit: Unit<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>) {
        return new Unit((this.m as number) - (unit.m as number),
            (this.kg as number) - (unit.kg as number),
            (this.s as number) - (unit.s as number),
            (this.a as number) - (unit.a as number),
            (this.k as number) - (unit.k as number),
            (this.mol as number) - (unit.mol as number),
            (this.cd as number) - (unit.cd as number),
            this.times / unit.times);
    }
    toString() {
        let result: string[] = [];
        result.push(this.baseUnitToString("m", this.m));
        result.push(this.baseUnitToString("kg", this.kg));
        result.push(this.baseUnitToString("s", this.s));
        result.push(this.baseUnitToString("a", this.a));
        result.push(this.baseUnitToString("k", this.k));
        result.push(this.baseUnitToString("mol", this.mol));
        result.push(this.baseUnitToString("cd", this.cd));
        return result.filter(r => r).join("*");
    }
    private baseUnitToString(baseUnit: string, baseUnitNumber: number) {
        if (baseUnitNumber === 1) {
            return ` ${baseUnit} `;
        } else if (baseUnitNumber < 0) {
            return ` ${baseUnit}^(${baseUnitNumber}) `;
        } else if (baseUnitNumber > 0) {
            return ` ${baseUnit}^${baseUnitNumber} `;
        } else {
            return "";
        }
    }
}
```

### 定义常用物理量单位

```ts
const m = new Unit<1, 0, 0, 0, 0, 0, 0>(1, 0, 0, 0, 0, 0, 0);
const s = new Unit<0, 0, 1, 0, 0, 0, 0>(0, 0, 1, 0, 0, 0, 0);
const kg = new Unit<0, 1, 0, 0, 0, 0, 0>(0, 1, 0, 0, 0, 0, 0);
const N = new Unit<1, 1, -2, 0, 0, 0, 0>(1, 1, -2, 0, 0, 0, 0);
const J = new Unit<2, 1, -2, 0, 0, 0, 0>(2, 1, -2, 0, 0, 0, 0);
const km = new Unit<1, 0, 0, 0, 0, 0, 0>(1, 0, 0, 0, 0, 0, 0, 1000);
```

### 定义物理量

```ts
class Quantity<
    Tm extends number,
    Tkg extends number,
    Ts extends number,
    TA extends number,
    TK extends number,
    Tmol extends number,
    Tcd extends number> {
    constructor(public num: number, public unit: Unit<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>) { }
    toString() {
        return (this.num * this.unit.times) + "" + this.unit.toString();
    }
    add(quantity: Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>) {
        if (this.unit.times === quantity.unit.times) {
            return new Quantity(this.num + quantity.num, this.unit);
        } else if (this.unit.times > quantity.unit.times) {
            return new Quantity(this.num * this.unit.times / quantity.unit.times + quantity.num, quantity.unit);
        } else {
            return new Quantity(this.num * quantity.unit.times / this.unit.times + quantity.num, this.unit);
        }
    }
    minus(quantity: Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>) {
        if (this.unit.times === quantity.unit.times) {
            return new Quantity(this.num - quantity.num, this.unit);
        } else if (this.unit.times > quantity.unit.times) {
            return new Quantity(this.num * this.unit.times / quantity.unit.times - quantity.num, quantity.unit);
        } else {
            return new Quantity(this.num * quantity.unit.times / this.unit.times - quantity.num, this.unit);
        }
    }
    multiple<Vm extends number,
        Vkg extends number,
        Vs extends number,
        VA extends number,
        VK extends number,
        Vmol extends number,
        Vcd extends number>(quantity: Quantity<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>) {
        return new Quantity(this.num * quantity.num, this.unit.multiple(quantity.unit));
    }
    divide<Vm extends number,
        Vkg extends number,
        Vs extends number,
        VA extends number,
        VK extends number,
        Vmol extends number,
        Vcd extends number>(quantity: Quantity<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>) {
        return new Quantity(this.num / quantity.num, this.unit.divide(quantity.unit));
    }
}
```

### 使用

```ts
new Quantity(1, km).add(new Quantity(3, m)); // 1 km + 3 m = 1003 m
new Quantity(1, km).minus(new Quantity(3, m)); // 1 km - 3m = 997 m
new Quantity(1, km).multiple(new Quantity(10, N)); // 1 km * 10 N = 10000 m^2 * kg * s^(-2)
new Quantity(1, km).divide(new Quantity(4, s)); // 1 km / 4 s = 250 m * s^(-1)
new Quantity(1, km).add(new Quantity(3, kg)); // 编译错误, km 和 kg 不是同一个单位，
(new Quantity(1, km).multiple(new Quantity(10, N)).add(new Quantity(2, km).multiple(new Quantity(4, N)))); // (1 km * 10 N) + (2 km * 4 N) = 18000 m^2 * kg * s^(-2)
```

### 不足

+ js 的限制，不能重载运算符，不能自定义语法，导致使用时麻烦
+ 虽然加减操作可以保证类型安全，乘除操作的结果的类型是 `Unit<number, number, number, ...number>`，它的类型被范围扩大了，不是实际的类型，这是 typescript 的限制

### 改善


先去掉泛型：

```ts
class Unit {
    constructor(
        public m: number,
        public kg: number,
        public s: number,
        public a: number,
        public k: number,
        public mol: number,
        public cd: number,
        public times = 1) { }
    multiple(unit: Unit) {
        return new Unit(this.m + unit.m,
            this.kg + unit.kg,
            this.s + unit.s,
            this.a + unit.a,
            this.k + unit.k,
            this.mol + unit.mol,
            this.cd + unit.cd,
            this.times * unit.times);
    }
    divide(unit: Unit) {
        return new Unit(this.m - unit.m,
            this.kg - unit.kg,
            this.s - unit.s,
            this.a - unit.a,
            this.k - unit.k,
            this.mol - unit.mol,
            this.cd - unit.cd,
            this.times / unit.times);
    }
    power(num: number) {
        return new Unit(this.m * num,
            this.kg * num,
            this.s * num,
            this.a * num,
            this.k * num,
            this.mol * num,
            this.cd * num,
            this.times ** num);
    }
    get is1() {
        return this.kg === 0
            && this.s === 0
            && this.a === 0
            && this.k === 0
            && this.mol === 0
            && this.cd === 0;
    }
    toString() {
        let result: string[] = [];
        result.push(this.baseUnitToString("m", this.m));
        result.push(this.baseUnitToString("kg", this.kg));
        result.push(this.baseUnitToString("s", this.s));
        result.push(this.baseUnitToString("a", this.a));
        result.push(this.baseUnitToString("k", this.k));
        result.push(this.baseUnitToString("mol", this.mol));
        result.push(this.baseUnitToString("cd", this.cd));
        return result.filter(r => r).join("*");
    }
    isSameBasicUnit(unit: Unit) {
        return this.m === unit.m
            && this.kg === unit.kg
            && this.s === unit.s
            && this.a === unit.a
            && this.k === unit.k
            && this.mol === unit.mol
            && this.cd === unit.cd;
    }
    private baseUnitToString(baseUnit: string, baseUnitNumber: number) {
        if (baseUnitNumber === 1) {
            return ` ${baseUnit} `;
        } else if (baseUnitNumber < 0) {
            return ` ${baseUnit}^(${baseUnitNumber}) `;
        } else if (baseUnitNumber > 0) {
            return ` ${baseUnit}^${baseUnitNumber} `;
        } else {
            return "";
        }
    }
}

const m = new Unit(1, 0, 0, 0, 0, 0, 0);
const s = new Unit(0, 0, 1, 0, 0, 0, 0);
const kg = new Unit(0, 1, 0, 0, 0, 0, 0);
const N = new Unit(1, 1, -2, 0, 0, 0, 0);
const J = new Unit(2, 1, -2, 0, 0, 0, 0);
const km = new Unit(1, 0, 0, 0, 0, 0, 0, 1000);

class Quantity {
    constructor(public num: number, public unit: Unit = new Unit(0, 0, 0, 0, 0, 0, 0, 1)) { }
    toString() {
        return (this.num * this.unit.times) + "" + this.unit.toString();
    }
    add(quantity: Quantity) {
        if (!this.unit.isSameBasicUnit(quantity.unit)) {
            throw `Cannot operate: ${this.unit.toString()} + ${quantity.unit.toString()}`;
        }
        if (this.unit.times === quantity.unit.times) {
            return new Quantity(this.num + quantity.num, this.unit);
        } else if (this.unit.times > quantity.unit.times) {
            return new Quantity(this.num * this.unit.times / quantity.unit.times + quantity.num, quantity.unit);
        } else {
            return new Quantity(this.num * quantity.unit.times / this.unit.times + quantity.num, this.unit);
        }
    }
    minus(quantity: Quantity) {
        if (!this.unit.isSameBasicUnit(quantity.unit)) {
            throw `Cannot operate: ${this.unit.toString()} + ${quantity.unit.toString()}`;
        }
        if (this.unit.times === quantity.unit.times) {
            return new Quantity(this.num - quantity.num, this.unit);
        } else if (this.unit.times > quantity.unit.times) {
            return new Quantity(this.num * this.unit.times / quantity.unit.times - quantity.num, quantity.unit);
        } else {
            return new Quantity(this.num * quantity.unit.times / this.unit.times - quantity.num, this.unit);
        }
    }
    multiple(quantity: Quantity) {
        return new Quantity(this.num * quantity.num, this.unit.multiple(quantity.unit));
    }
    divide(quantity: Quantity) {
        return new Quantity(this.num / quantity.num, this.unit.divide(quantity.unit));
    }
    power(num: number) {
        return new Quantity(this.num ** num, this.unit.power(num));
    }
}
```

再以字符串的形式来描述，tokenize 成 tokens：

```ts
const unitMapper: { [name: string]: Unit } = { m, s, kg, N, J, km };
type NumberToken = {
    kind: "number",
    value: number,
}
type UnitToken = {
    kind: "unit",
    unit: Unit,
}
type OperatorToken = {
    kind: "operator",
    char: "-" | "+" | "*" | "/" | "^",
    priority: 0 | 1 | 2,
}
type LeftPriorityToken = {
    kind: "left_priority",
    priority: -1,
}
type RightPriorityToken = {
    kind: "right_priority",
}
type QuantityToken = {
    kind: "quantity",
    quantity: Quantity,
}
type Token = NumberToken | UnitToken | OperatorToken | LeftPriorityToken | RightPriorityToken;
type TreeNode = {
    kind: "node",
    left: QuantityToken | TreeNode,
    operator: "-" | "+" | "*" | "/" | "^",
    right: QuantityToken | TreeNode,
}
function tokenize(expression: string): Token[] {
    const tokens: Token[] = [];
    let unsure = "";
    function flushUnsure() {
        if (unsure) {
            if (isNaN(+unsure)) {
                const unit = unitMapper[unsure];
                if (!unit) {
                    throw `Unknown unit: ${unsure}`;
                }
                tokens.push({
                    kind: "unit",
                    unit,
                });
            } else {
                tokens.push({
                    kind: "number",
                    value: +unsure,
                });
            }
            unsure = "";
        }
    }
    for (const ch of expression) {
        if (ch !== " "
            && ch !== "+"
            && ch !== "-"
            && ch !== "*"
            && ch !== "/"
            && ch !== "("
            && ch !== ")"
            && ch !== "^") {
            unsure += ch;
        } else {
            flushUnsure();
            if (ch === "+"
                || ch === "-"
                || ch === "*"
                || ch === "/"
                || ch === "^") {
                tokens.push({
                    kind: "operator",
                    char: ch,
                    priority: (ch === "+" || ch === "-") ? 0 : ((ch === "*" || ch === "/") ? 1 : 2),
                });
            } else if (ch === "(") {
                tokens.push({
                    kind: "left_priority",
                    priority: -1,
                });
            } else if (ch === ")") {
                tokens.push({
                    kind: "right_priority",
                });
            }
        }
    }
    flushUnsure();
    return tokens;
}
```


再把 token 中的数字和单位合并成量：


```ts
function mergeNumberAndUnitToQuantity(tokens: Token[]): (OperatorToken | LeftPriorityToken | RightPriorityToken | QuantityToken)[] {
    let result: (OperatorToken | LeftPriorityToken | RightPriorityToken | QuantityToken)[] = [];
    let i = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (token.kind === "number") {
            const quantity = new Quantity(token.value);
            result.push({
                kind: "quantity",
                quantity,
            });
            i++;
            let lastUnit: UnitToken | undefined;
            while (i < tokens.length) {
                const unitToken = tokens[i];
                if (unitToken.kind === "unit") { // 2 m
                    quantity.unit = quantity.unit.multiple(unitToken.unit);
                    lastUnit = unitToken;
                    i++;
                } else if (unitToken.kind === "operator"
                    && lastUnit) {
                    if (unitToken.char === "^") { // 2 m^2, 2 m^(-2)
                        if (i + 1 < tokens.length
                            && tokens[i + 1].kind === "number") { // 2 m^2
                            quantity.unit = quantity.unit.multiple(lastUnit.unit.power((tokens[i + 1] as NumberToken).value - 1));
                            i += 2;
                        } else if (i + 4 < tokens.length
                            && tokens[i + 1].kind === "left_priority"
                            && tokens[i + 2].kind === "operator"
                            && (tokens[i + 2] as OperatorToken).char === "-"
                            && tokens[i + 3].kind === "number"
                            && tokens[i + 4].kind === "right_priority") { // 2 m^(-2)
                            quantity.unit = quantity.unit.multiple(lastUnit.unit.power(-(tokens[i + 3] as NumberToken).value - 1));
                            i += 5;
                        } else {
                            lastUnit = undefined;
                            break;
                        }
                    } else if (unitToken.char === "*") { // 2 m * kg
                        if (i + 1 < tokens.length
                            && tokens[i + 1].kind === "unit") { // 2 m^2
                            quantity.unit = quantity.unit.multiple((tokens[i + 1] as UnitToken).unit);
                            lastUnit = tokens[i + 1] as UnitToken;
                            i += 2;
                        } else {
                            lastUnit = undefined;
                            break;
                        }
                    } else {
                        lastUnit = undefined;
                        break;
                    }
                } else {
                    lastUnit = undefined;
                    break;
                }
            }
        } else if (token.kind === "unit") {
            throw `Unexpected unit: ${token.unit.toString()}`;
        } else {
            result.push(token);
            i++;
        }
    }
    return result;
}
```

再转换成后缀表达式，再转换成树结构：


```ts
function parse(tokens: (OperatorToken | LeftPriorityToken | RightPriorityToken | QuantityToken)[]): TreeNode {
    const leftPriorityOrOperatorStack: (LeftPriorityToken | OperatorToken)[] = [];
    const suffixStack: (QuantityToken | OperatorToken)[] = [];
    for (const token of tokens) {
        if (token.kind === "left_priority") {
            leftPriorityOrOperatorStack.push(token);
        } else if (token.kind === "right_priority") {
            if (leftPriorityOrOperatorStack.length === 0) {
                throw "( and ) mismatch";
            }
            let leftPriorityOrOperator = leftPriorityOrOperatorStack.pop();
            while (leftPriorityOrOperator.kind === "operator") {
                suffixStack.push(leftPriorityOrOperator);
                if (leftPriorityOrOperatorStack.length === 0) {
                    throw "( and ) mismatch";
                }
                leftPriorityOrOperator = leftPriorityOrOperatorStack.pop();
            }
        } else if (token.kind === "quantity") {
            suffixStack.push(token);
        } else if (token.kind === "operator") {
            if (leftPriorityOrOperatorStack.length > 0
                && leftPriorityOrOperatorStack[leftPriorityOrOperatorStack.length - 1].kind === "operator") {
                const operatorToken = leftPriorityOrOperatorStack[leftPriorityOrOperatorStack.length - 1] as OperatorToken;
                if (token.priority <= operatorToken.priority) {
                    leftPriorityOrOperatorStack.pop();
                    suffixStack.push(operatorToken);
                }
            }
            leftPriorityOrOperatorStack.push(token);
        }
    }
    while (leftPriorityOrOperatorStack.length > 0) {
        const leftPriorityOrOperator = leftPriorityOrOperatorStack.pop();
        if (leftPriorityOrOperator.kind === "left_priority") {
            throw "too much (";
        }
        suffixStack.push(leftPriorityOrOperator);
    }
    const quantityOrTreeStack: (QuantityToken | TreeNode)[] = [];
    for (const token of suffixStack) {
        if (token.kind === "quantity") {
            quantityOrTreeStack.push(token);
        } else {
            const right = quantityOrTreeStack.pop();
            const left = quantityOrTreeStack.pop();
            quantityOrTreeStack.push({
                kind: "node",
                left,
                operator: token.char,
                right,
            });
        }
    }
    return quantityOrTreeStack[0] as TreeNode;
}
```

这里根据生成的树，可以用来验证之前无法验证的类型安全问题。当然也可以根据树结构计算出最终结果：


```ts
function calculate(node: TreeNode): Quantity {
    const left = node.left.kind === "quantity" ? node.left.quantity : calculate(node.left);
    const right = node.right.kind === "quantity" ? node.right.quantity : calculate(node.right);
    if (node.operator === "+") {
        return left.add(right);
    }
    if (node.operator === "-") {
        return left.minus(right);
    }
    if (node.operator === "*") {
        return left.multiple(right);
    }
    if (node.operator === "/") {
        return left.divide(right);
    }
    if (!right.unit.is1) {
        throw "Cannot power with a quantity with unit.";
    }
    return left.power(right.num);
}
```

最后验证结果：


```ts
function compute(expression: string) {
    const tokens = tokenize(expression);
    const mergedTokens = mergeNumberAndUnitToQuantity(tokens);
    const tree = parse(mergedTokens);
    console.log(calculate(tree).toString());
}
compute("1 km + 3 m");
compute("1 km - 3 m");
compute("1 km * 10 N");
compute("1 km / 4 s");
compute("1 km * 10 N + 2 km * 4 N");
compute("(1 km - 400 m) / 4 s");
compute("18000 m^2 * kg * s^(-2) / 4 kg");
compute("60 N / (1 m + 2 m) * 4 N");
compute("60 N / ((1 m - 2 m + 3 m) * 4 N)");
compute("1 + ((2 + 3 ) * 4) - 5");
```

### 用 C++ 模板来实现

```c++
#include <iostream>
#include "math.h"
#include <string>
#include <vector>
#include <algorithm>
#include <numeric>

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd>
struct Unit {
	explicit Unit(const double _times = 1) : times(_times) {}
	double times;

	template <int num>
	inline const auto powUnit()const {
		return Unit<Tm * num, Tkg * num, Ts * num, TA * num, TK * num, Tmol * num, Tcd * num>(pow(this->times, num));
	}
	inline const auto toString()const {
		std::vector<std::string> vec{
			Unit::baseUnitToString("m", Tm),
			Unit::baseUnitToString("kg", Tkg),
			Unit::baseUnitToString("s", Ts),
			Unit::baseUnitToString("A", TA),
			Unit::baseUnitToString("K", TK),
			Unit::baseUnitToString("mol", Tmol),
			Unit::baseUnitToString("cd", Tcd)
		};
		const auto end = std::remove_if(vec.begin(), vec.end(), [](std::string s) {return s.empty(); });
		return std::accumulate(vec.begin(), end, std::string(""), [](std::string a, std::string b) {return a.empty() ? b : a + "*" + b; });
	}
private:
	static inline const auto baseUnitToString(const std::string& baseUnit, const int baseUnitNumber) {
		if (baseUnitNumber == 1) {
			return " " + baseUnit + " ";
		}
		else if (baseUnitNumber < 0) {
			return " " + baseUnit + "^(" + std::to_string(baseUnitNumber) + ") ";
		}
		else if (baseUnitNumber > 0) {
			return " " + baseUnit + "^" + std::to_string(baseUnitNumber) + " ";
		}
		else {
			return std::string("");
		}
	}
};

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd, int Vm, int Vkg, int Vs, int VA, int VK, int Vmol, int Vcd>
inline const auto operator*(const Unit<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& unit1, const Unit<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>& unit2) {
	return  Unit<Tm + Vm, Tkg + Vkg, Ts + Vs, TA + VA, TK + VK, Tmol + Vmol, Tcd + Vcd>(unit1.times * unit2.times);
}

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd, int Vm, int Vkg, int Vs, int VA, int VK, int Vmol, int Vcd>
inline const auto operator/(const Unit<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& unit1, const Unit<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>& unit2) {
	return  Unit<Tm - Vm, Tkg - Vkg, Ts - Vs, TA - VA, TK - VK, Tmol - Vmol, Tcd - Vcd>(unit1.times / unit2.times);
}

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd>
struct Quantity {
	explicit Quantity(const double _num, const Unit<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& _unit) : num(_num), unit(_unit) {}
	double num;
	Unit<Tm, Tkg, Ts, TA, TK, Tmol, Tcd> unit;

	template <int number>
	inline const auto powQuantity() const {
		return Quantity<Tm * number, Tkg * number, Ts * number, TA * number, TK * number, Tmol * number, Tcd * number>(pow(this->num, number), this->unit.powUnit<number>());
	}
	inline const auto toString()  const {
		return std::to_string(this->num * this->unit.times) + this->unit.toString();
	}
};

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd>
inline const auto operator+(const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity1, const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity2) {
	if (quantity1.unit.times == quantity2.unit.times) {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num + quantity2.num, quantity1.unit);
	}
	else if (quantity1.unit.times > quantity2.unit.times) {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num * quantity1.unit.times / quantity2.unit.times + quantity2.num, quantity2.unit);
	}
	else {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num * quantity2.unit.times / quantity1.unit.times + quantity2.num, quantity1.unit);
	}
}

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd>
inline const auto operator-(const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity1, const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity2) {
	if (quantity1.unit.times == quantity2.unit.times) {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num - quantity2.num, quantity1.unit);
	}
	else if (quantity1.unit.times > quantity2.unit.times) {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num * quantity1.unit.times / quantity2.unit.times - quantity2.num, quantity2.unit);
	}
	else {
		return Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>(quantity1.num * quantity2.unit.times / quantity1.unit.times - quantity2.num, quantity1.unit);
	}
}

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd, int Vm, int Vkg, int Vs, int VA, int VK, int Vmol, int Vcd>
inline const auto operator*(const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity1, const Quantity<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>& quantity2) {
	return  Quantity<Tm + Vm, Tkg + Vkg, Ts + Vs, TA + VA, TK + VK, Tmol + Vmol, Tcd + Vcd>(quantity1.num * quantity2.num, quantity1.unit * quantity2.unit);
}

template <int Tm, int Tkg, int Ts, int TA, int TK, int Tmol, int Tcd, int Vm, int Vkg, int Vs, int VA, int VK, int Vmol, int Vcd>
inline const auto operator/(const Quantity<Tm, Tkg, Ts, TA, TK, Tmol, Tcd>& quantity1, const Quantity<Vm, Vkg, Vs, VA, VK, Vmol, Vcd>& quantity2) {
	return  Quantity<Tm - Vm, Tkg - Vkg, Ts - Vs, TA - VA, TK - VK, Tmol - Vmol, Tcd - Vcd>(quantity1.num / quantity2.num, quantity1.unit / quantity2.unit);
}

using Length = Quantity<1, 0, 0, 0, 0, 0, 0>;
using Mass = Quantity<0, 1, 0, 0, 0, 0, 0>;
using Time = Quantity<0, 0, 1, 0, 0, 0, 0>;

const auto m = Unit<1, 0, 0, 0, 0, 0, 0>();
const auto s = Unit<0, 0, 1, 0, 0, 0, 0>();
const auto kg = Unit<0, 1, 0, 0, 0, 0, 0>();
const auto N = Unit<1, 1, -2, 0, 0, 0, 0>();
const auto J = Unit<2, 1, -2, 0, 0, 0, 0>();
const auto km = Unit<1, 0, 0, 0, 0, 0, 0>(1000);

const auto c = Length(1, km) * Mass(2, kg) + Length(100, m) * Mass(20, kg);
std::cout << c.toString();
const auto d = Length(3, m).powQuantity<2>();
std::cout << d.toString();
```
