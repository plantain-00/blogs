# 一种后台配置方案

经常会有一类后台配置需求，要配置的数据结构复杂且多变，但数据量小；

因为是内部使用，对浏览器要求不高，支持最新版本的 chrome 即可。

从数据结构上看，适合用 json 格式来传递数据，而前端可以用 angular、vuejs 等 MVVM 框架来简化开发。

这里说的方案的前端开发速度更快，是 [json-editor](https://github.com/jdorn/json-editor) 前端库，通过 json schema 来定义要配置的数据的格式，UI 提供与这个 json schema 匹配的操作。

配置完成后，会得到配置好的 json 数据，再传递给后端进行验证并保存。

后端验证数据时也可以使用这个 json schema 来验证，所以是前后端共用的，可以在后端通过 API 的形式提供给前端，维护这个 schema 就可以了。

如果后端是 nodejs，对 json schema 的验证，可以使用库：https://github.com/epoberezkin/ajv

这个 json-editor 库支持前端数据验证、界面多语言、多 UI，基本满足功能需要。

对于多媒体形式的资源，例如图片，可以在统一的上传界面上传后，配置最终的 URL 即可。

另外，如果后端使用 typescript，可以通过 https://github.com/YousefED/typescript-json-schema 由 typescript 的类型生成相应的 json schema，这样只需要维护一份数据结构。
