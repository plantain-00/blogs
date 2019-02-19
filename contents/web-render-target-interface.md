# 一个 web 渲染 target 抽象

常见的 web 渲染 target 有 canvas, svg, dom

抽象出各个 target 的共有接口后，业务可以针对抽象出的接口编程，从而解耦业务层和渲染层的代码

canvas 操作是线性的、命令式的，执行顺序很重要，而 dom 和 svg 是树形的、声明式的，生成顺序不重要

## target 模型

这里使用 dom 和 svg 的模型，作为抽象的 target 的模型，例如

```html
<button title="aaa" style="">
  <span><span>
  <span><span>
</button>
```

### node 和 node name

节点，例如上述例子中的 button 节点和 span 节点，button 和 span 分别是 node name

### attribute

一个 node 可能有多个 attribute，例如上述例子中的 `title="aaa"` 和 `style=""`

attribute 的作用域是所在 node 和子 node，例如

```html
<div style="color: black">
    <button style="color: white">
      白色
    </button>
    黑色
</div>
```

### child node

一个 node 可能有多个子节点，例如上述例子中的 span 节点

## canvas 实现 target 模型的原理

canvas 中存在 `ctx.save()` 和 `ctx.retore()`，这一对组合形成了一个作用域，例如

```ts
ctx.fillStyle = 'black'
    ctx.save()
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, 10, 10) // 白色
    ctx.restore()
ctx.fillRect(0, 0, 10, 10) // 黑色
```

这和 attribute 的作用域很类似，所以可以把 node 生成为一个用 `ctx.save()` 和 `ctx.retore()` 包裹的一段 canvas 操作，包含了 attribute 和 child 所对应的 canvas 操作

## 渲染 target 抽象接口和实现

### 创建 node 的接口

```ts
interface RenderTarget<T = void, TAttributes = T> {
  createNode(
    attributesAction: () => TAttributes[],
    childrenAction: () => T[],
    nodeName?: string,
  ): T
}
```

svg 的实现是

```ts
createNode(attributesAction: () => string[], childrenAction: () => string[], nodeName?: string) {
  const attributes = attributesAction()
  const children = childrenAction()
  if (!nodeName) {
    nodeName = 'g'
  }
  return `<${nodeName} ${attributes.join(' '))}>
    ${children.join('\n')}
  </${nodeName}>`
}
```

canvas 的实现是

```ts
createNode(attributesAction: () => void, childrenAction: () => void) {
  this.ctx.save()
  attributesAction()
  childrenAction()
  this.ctx.restore()
}
```

### 填充颜色的接口

```ts
fillColor(color: string): TAttributes

// svg
fillColor(color: string) {
  return `fill="${color}"`
}

// canvas
fillColor(color: string) {
  this.ctx.fillStyle = color
}
```

### 绘制矩形的接口

```ts
fillRect(attributesAction: () => TAttributes[], region: Region): T

// svg
fillRect(attributesAction: () => string[], region: Region) {
  const attributes = attributesAction()
  const { x, y, width, height } = region
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${attributes.join(' ')} />`
}

// canvas
fillRect(attributesAction: () => void, region: Region) {
  attributesAction()
  const { x, y, width, height } = region
  x *= this.multiplier
  y *= this.multiplier
  width *= this.multiplier
  height *= this.multiplier
  this.ctx.fillRect(x, y, width, height)
}
```

### transform / matrix 接口

```ts
transform(a: number, b: number, c: number, d: number, e: number, f: number): TAttributes

// svg
transform(a: number, b: number, c: number, d: number, e: number, f: number) {
  return `transform="matrix(${a} ${b} ${c} ${d} ${e} ${f})"`
}

// canvas
transform(a: number, b: number, c: number, d: number, e: number, f: number) {
  e *= this.multiplier
  f *= this.multiplier
  this.ctx.transform(a, b, c, d, e, f)
}
```

### 透明度接口

```ts
setAlpha(alpha: number): TAttributes

// svg
setAlpha(alpha: number) {
  return `opacity="${alpha}"`
}

// canvas
setAlpha(alpha: number) {
  this.ctx.globalAlpha = alpha
}
```

### 图片绘制接口

```ts
drawImage(
  uri: string,
  image: ImageElementData,
  x: number,
  y: number,
  width: number,
  height: number,
  attributesAction?: () => TAttributes[],
): T

// svg
drawImage(
  uri: string,
  _image: ImageElementData,
  x: number,
  y: number,
  width: number,
  height: number,
  attributesAction?: () => string[],
) {
  let attributes: string[] = []
  if (attributesAction) {
    attributes = attributesAction()
  }
  return `<image xlink:href="${uri}" x="${x}" y="${y}" width="${width}" height="${height}" ${attributes.join(' ')} preserveAspectRatio="none" />`
}

// canvas
drawImage(
  _url: string,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  attributesAction?: () => void,
) {
  if (attributesAction) {
    attributesAction()
  }
  x *= this.multiplier
  y *= this.multiplier
  width *= this.multiplier
  height *= this.multiplier
  this.ctx.drawImage(image, x, y, width, height)
}
```

### 平移接口

```ts
translate(x: number, y: number): TAttributes

// svg
translate(x: number, y: number) {
  return `transform="translate(${x} ${y})"`
}

// canvas
translate(x: number, y: number) {
  if (x !== 0 || y !== 0) {
    x *= this.multiplier
    y *= this.multiplier
    this.ctx.translate(x, y)
  }
}
```

## svg 绘制接口

```ts
drawSvg(url: string, svg: string, image: ImageElementData, width: number, height: number): T

// svg
drawSvg(_url: string, svg: string, _image: ImageElementData, _width: number, _height: number) {
  return svg
}

// canvas
drawSvg(url: string, _svg: string, image: ImageElementData, width: number, height: number) {
  this.drawImage(url, image, 0, 0, width, height)
}
```

## translate 和 rotate 接口

```ts
translateAndRotate(
  x: number,
  y: number,
  rotate: number,
  rotateX: number,
  rotateY: number,
): TAttributes

// svg
translateAndRotate(x: number, y: number, rotate: number, rotateX: number, rotateY: number) {
  if (x !== 0 || y !== 0) {
    if (rotate !== 0) {
      return `transform="translate(${x} ${y}) rotate(${rotate} ${rotateX} ${rotateY})"`
    }
    return `transform="translate(${x} ${y})"`
  }
  if (rotate !== 0) {
    return `transform="rotate(${rotate} ${rotateX} ${rotateY})"`
  }
  return ''
}

// canvas
translateAndRotate(x: number, y: number, rotate: number, rotateX: number, rotateY: number) {
  this.translate(x, y)
  if (rotate !== 0) {
    this.svgRotate(rotate, rotateX, rotateY)
  }
}
svgRotate(angle: number, x: number, y: number) {
  this.translate(x, y)
  angle = (angle * Math.PI) / 180
  this.ctx.rotate(angle)
  this.translate(-x, -y)
}
```

## transform 和 rotate 接口

```ts
transformAndRotate(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  rotate: number,
  rotateX: number,
  rotateY: number,
): TAttributes

// svg
transformAndRotate(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  rotate: number,
  rotateX: number,
  rotateY: number,
) {
  return `transform="matrix(${a} ${b} ${c} ${d} ${e} ${f}) rotate(${rotate} ${rotateX} ${rotateY})"`
}

// canvas
transformAndRotate(
  a: number,
  b: number,
  c: number,
  d: number,
  e: number,
  f: number,
  rotate: number,
  rotateX: number,
  rotateY: number,
) {
  this.transform(a, b, c, d, e, f)
  this.svgRotate(rotate, rotateX, rotateY)
}
```

### 文字绘制接口

```ts
fillText(
  x: number,
  y: number,
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  rotate: number,
  rotateX: number,
  rotateY: number,
): T
fillText2(
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  matrix: TransformMatrix,
  width: number,
  baseline?: TextBaselineType,
  textDecoration?: string,
): T

// svg
fillText(
  x: number,
  y: number,
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  rotate: number,
  rotateX: number,
  rotateY: number,
) {
  const rotateAttribute = rotate !== 0 ? `transform="rotate(${rotate} ${rotateX} ${rotateY})"` : ''
  return `<text ${rotateAttribute}>
    <tspan
      x="${x}"
      y="${y}"
      fill="${fill}"
      style="font-size:${fontSize}px;font-family:${fontFamily}"
    >${text}</tspan>
  </text>`
}
fillText2(
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  matrix: TransformMatrix,
  _width: number,
  baseline?: TextBaselineType,
  textDecoration?: string,
) {
  const textDecorationAttribute = textDecoration ? ` text-decoration="${textDecoration}"` : ''
  return `<text
    text-anchor="middle"
    dominant-baseline="${baseline === 'baseline' ? 'alphabetic' : 'central'}"
    font-family="${fontFamily}"
    fill="${fill}"
    font-size="${fontSize}"
    ${this.transform(...matrix)}
    style="user-select: none"${textDecorationAttribute}
  >
    ${text}
  </text>`
}

// canvas
fillText(
  x: number,
  y: number,
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  rotate: number,
  rotateX: number,
  rotateY: number,
) {
  this.createNode(
    () => {
      fontSize *= this.multiplier
      this.ctx.font = `${fontSize}px ${fontFamily}`
      this.fillColor(fill)
      if (rotate !== 0) {
        this.svgRotate(rotate, rotateX, rotateY)
      }
      x *= this.multiplier
      y *= this.multiplier
      this.ctx.fillText(text, x, y)
    },
    () => [],
  )
}
fillText2(
  fill: string,
  fontSize: number,
  fontFamily: string,
  text: string,
  matrix: TransformMatrix,
  width: number,
  baseline?: TextBaselineType,
  textDecoration?: string,
) {
  this.createNode(
    () => {
      fontSize *= this.multiplier
      this.ctx.font = `${fontSize}px ${fontFamily}`
      this.fillColor(fill)
      this.transform(...matrix)
      const { textAlign, textBaseline } = this.ctx
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = baseline === 'baseline' ? 'alphabetic' : 'middle'
      this.ctx.fillText(text, 0, 0)
      this.ctx.textAlign = textAlign
      if (textDecoration && textDecoration !== 'none') {
        const x = -width / 2
        let y = 0
        if (textDecoration === 'underline') {
          y = fontSize / 2
        } else if (textDecoration === 'overline') {
          y = -fontSize / 2
        }
        const thickness = fontSize / 20
        y -= thickness
        this.ctx.fillRect(x, y, width, thickness)
      }
      this.ctx.textBaseline = textBaseline
    },
    () => [],
  )
}
```

### 圆形剪裁接口

```ts
circleClip(x: number, y: number, radius: number): T

// svg
circleClip(x: number, y: number, radius: number) {
  return `<circle cx="${x}" cy="${y}" r="${radius}" />`
}

// canvas
circleClip(x: number, y: number, radius: number) {
  this.ctx.beginPath()
  x *= this.multiplier
  y *= this.multiplier
  radius *= this.multiplier
  const endAngle = Math.PI * 2
  this.ctx.arc(x, y, radius, 0, endAngle)
  this.ctx.closePath()
  this.ctx.clip()
}
```

### 矩形剪裁接口

```ts
rectClip(x: number, y: number, width: number, height: number): T | T[]

// svg
rectClip(x: number, y: number, width: number, height: number) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" />`
}

// canvas
rectClip(x: number, y: number, width: number, height: number) {
  this.ctx.beginPath()
  x *= this.multiplier
  y *= this.multiplier
  width *= this.multiplier
  height *= this.multiplier
  this.ctx.rect(x, y, width, height)
  this.ctx.closePath()
  this.ctx.clip()
}
```

### clipPath 接口

```ts
createClipPath(shapeAction: () => T , id: string): T

// svg
createClipPath(shapeAction: () => string, id: string) {
  const shape = shapeAction()
  return `<defs>
    <clipPath id="image-clip-path-${id}">
    ${shape}
    </clipPath>
  </defs>`
}

// canvas
createClipPath(shapeAction: () => void) {
  shapeAction()
}
```

### clipPath 的 url 接口

```ts
createClipPathUrl(id: string): TAttributes

// svg
createClipPathUrl(id: string) {
  return `clip-path="url(#image-clip-path-${id})"`
}

// canvas
createClipPathUrl() {
  // do nothing
}
```

### 图片 filter 接口

```ts
createImageFilter(imageFilter: ImageFilter, id: string): T

// svg
createImageFilter(imageFilter: ImageFilter, id: string) {
  let filterAttributes = ''
  const filters: string[] = []
  if (imageFilter.blur !== undefined) {
    const value = 100 + imageFilter.blur * 2
    filterAttributes = `x="-${imageFilter.blur}%" y="-${imageFilter.blur}%" width="${value}%" height="${value}%"`
    filters.push(`<feGaussianBlur in="SourceGraphic" stdDeviation="${imageFilter.blur}"></feGaussianBlur>`)
  }
  if (imageFilter.brightness !== undefined) {
    const brightness = 0.01 * imageFilter.brightness
    filters.push(`<feComponentTransfer>
      <feFuncR type="linear" slope="${brightness}"></feFuncR>
      <feFuncG type="linear" slope="${brightness}"></feFuncG>
      <feFuncB type="linear" slope="${brightness}"></feFuncB>
    </feComponentTransfer>`)
  }
  if (imageFilter.contrast !== undefined) {
    const contrast = 0.01 * imageFilter.contrast
    const intercept = 0.5 - 0.5 * contrast
    filters.push(`<feComponentTransfer>
      <feFuncR type="linear" slope="${contrast}" intercept="${intercept}"/>
      <feFuncG type="linear" slope="${contrast}" intercept="${intercept}"/>
      <feFuncB type="linear" slope="${contrast}" intercept="${intercept}"/>
    </feComponentTransfer>`)
  }
  if (imageFilter.grayscale !== undefined) {
    const grayscale = 1 - 0.01 * imageFilter.grayscale
    filters.push(`<feColorMatrix type="saturate" values="${grayscale}"></feColorMatrix>`)
  }
  if (imageFilter.hueRotate !== undefined) {
    filters.push(`<feColorMatrix type="hueRotate" values="${imageFilter.hueRotate}"></feColorMatrix>`)
  }
  if (imageFilter.invert !== undefined) {
    const a = 0.01 * imageFilter.invert
    const b = 1 - a
    filters.push(`<feComponentTransfer>
      <feFuncR type="table" tableValues="${a} ${b}"></feFuncR>
      <feFuncG type="table" tableValues="${a} ${b}"></feFuncG>
      <feFuncB type="table" tableValues="${a} ${b}"></feFuncB>
    </feComponentTransfer>`)
  }
  if (imageFilter.opacity !== undefined) {
    const opacity = 0.01 * imageFilter.opacity
    filters.push(`<feComponentTransfer>
      <feFuncA type="table" tableValues="0 ${opacity}">
    </feFuncA></feComponentTransfer>`)
  }
  if (imageFilter.saturate !== undefined) {
    const saturate = 0.01 * imageFilter.saturate
    filters.push(`<feColorMatrix type="saturate" values="${saturate}"></feColorMatrix>`)
  }
  if (imageFilter.sepia !== undefined) {
    const sepia = 1 - 0.01 * imageFilter.sepia
    filters.push(`<feColorMatrix type="matrix"
      values="${0.393 + 0.607 * sepia} ${0.769 - 0.769 * sepia} ${0.189 - 0.189 * sepia} 0 0
      ${0.349 - 0.349 * sepia} ${0.686 + 0.314 * sepia} ${0.168 - 0.168 * sepia} 0 0
      ${0.272 - 0.272 * sepia} ${0.534 - 0.534 * sepia} ${0.131 + 0.869 * sepia} 0 0
      0 0 0 1 0">
    </feColorMatrix>`)
  }
  return `<filter id="image-filter-${id}" ${filterAttributes}>
    ${filters.join('\n')}
  </filter>`
}

// canvas
createImageFilter(imageFilter: ImageFilter): void {
  const filters: string[] = []
  if (imageFilter.blur !== undefined) {
    filters.push(`blur(${imageFilter.blur}px)`)
  }
  if (imageFilter.brightness !== undefined) {
    filters.push(`brightness(${imageFilter.brightness}%)`)
  }
  if (imageFilter.contrast !== undefined) {
    filters.push(`contrast(${imageFilter.contrast}%)`)
  }
  if (imageFilter.grayscale !== undefined) {
    filters.push(`grayscale(${imageFilter.grayscale}%)`)
  }
  if (imageFilter.hueRotate !== undefined) {
    filters.push(`hue-rotate(${imageFilter.hueRotate}deg)`)
  }
  if (imageFilter.invert !== undefined) {
    filters.push(`invert(${imageFilter.invert}%)`)
  }
  if (imageFilter.opacity !== undefined) {
    filters.push(`opacity(${imageFilter.opacity}%)`)
  }
  if (imageFilter.saturate !== undefined) {
    filters.push(`saturate(${imageFilter.saturate}%)`)
  }
  if (imageFilter.sepia !== undefined) {
    filters.push(`sepia(${imageFilter.sepia}%)`)
  }
  const filter = filters.join(' ')
  if (filter) {
    this.act(() => (this.ctx.filter = filter), () => `filter = '${filter}'`)
  }
}
```

### image filter 的 url 接口

```ts
createImageFilterUrl(id: string): TAttributes

// svg
createImageFilterUrl(id: string) {
  return `filter="url(#image-filter-${id})"`
}

// canvas
createImageFilterUrl(_id: string) {
  // do nothing
}
```
