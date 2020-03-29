# 使用 Adobe CEP 开发 Photoshop 插件

CEP 官方文档：<https://github.com/Adobe-CEP/Getting-Started-guides>

CEP 官方资源：<https://github.com/Adobe-CEP/CEP-Resources>

ExtendScript 文档：<https://www.adobe.com/devnet/scripting.html>

## 总体介绍

Adobe CEP 是用来开发 Adobe 产品（包括 Photoshop）扩展的技术。

内部使用了 Chromium Embedded Framework 和 ExtendScript，前者可以让插件可以有 GUI（chromium），可以访问本地文件，可以发出网络请求（nodejs），后者可以操作 Adobe 产品。

插件包括一些几个部分：

1. manifest.xml：用于定义插件名称、版本、client 入口 html 文件路径、ExtendScript 脚本路径等信息
2. client 入口 html 文件：插件打开时显示的就是这个文件的 UI，开发方式和普通前端开发一样
3. ExtendScript 脚本

ExtendScript 是类似于 javascript 的语言，一般是 jsx 文件，里面定义了一些函数，在 client 端可以通过 `CSInterface.evalScript` 执行相应的脚本，并在 callback 中获得返回值。

## nodejs 支持

因为安全方面的原因，需要在 manifest.xml 里设置 `--enable-nodejs` 启用 nodejs 支持：

```xml
<Resources>
    <MainPath>./client/index.html</MainPath>
    <ScriptPath>./host/index.jsx</ScriptPath>
    <CEFCommandLine>
        <Parameter>--enable-nodejs</Parameter>
    </CEFCommandLine>
</Resources>
```

client 代码里可以直接写 nodejs 代码，例如 `require('fs')`，但如果 client 代码使用 webpack 等工具打包，打包结果里的 `require`、`__dirname`等会被移除掉。

所以，需要把 nodejs 代码从 client 的代码里独立出来，在 html 文件中通过 script 标签先于 client 代码加载；在 client 中以函数调用的形式调用 nodejs 代码中定义的函数。

nodejs 代码中 require 不支持相对路径，可以通过 `path.dirname(decodeURI(window.location.pathname))` 来转换为绝对路径后再 require。

## typescript 支持

nodejs 和普通前端都可以使用 typescript；对于 CSInterface，可以使用 <https://www.npmjs.com/package/csinterface-ts> 作为类型。

对于 ExtendScript，可以使用 tsx 作为扩展名，对于 Photoshop 的接口，可以使用 <https://www.npmjs.com/package/photoshop.d.ts> 作为类型。

## ExtendScript

ExtendScript 类似于 ECMAScript 3。

ExtendScript 脚本和 client 代码不在同一个进程中执行，所以传递复杂对象时必须要序列化为字符串，而 ExtendScript 里没有内置的 JSON.stringify，可以通过 json2 等 polyfill JSON 对象。

ExtendScript 可以通过 `#include` 来引入代码文件，但 `#include` 是不被 ECMAScript 和 Typescript 支持的，使用后 Typescript 编译不过，且导致智能提示等失效，所以不能用来加载 json2 文件。

还有一种方式是，通过 `$.evalFile(pluginDir + '/host/json2.js')` 来加载 json2 文件，其中 pluginDir 需要作为函数参数传入。

ExtendScript 脚本执行报错后不会提示具体的错误消息，解决方案是把代码放在 try...catch 中，具体错误提示就在 catch 到的 error 中。

对于文件等大对象，可以先以文件的形式保存到系统临时文件夹中，再把文件路径作为函数的参数或返回值传递。

## 调试

把项目文件夹 link 到插件文件夹，可以避免开发时复制文件。如果提示签名错误，可以执行 `defaults write com.adobe.CSXS.9 PlayerDebugMode 1` 以启用 debug 模式，然后杀死所有 `cfprefsd` 进程，让配置生效。

client 端的调试见：<https://github.com/Adobe-CEP/Getting-Started-guides/tree/master/Client-side%20Debugging>，对于 chrome 80 提示 document.registerElement is not a function，可以参考 <https://github.com/Adobe-CEP/CEP-Resources/issues/272> 解决

对于 ExtendScript，用 PS 打开 jsx 文件执行，代码里可以使用 alert 来打印变量。

## 签名和制作安装包

使用 `ZXPSignCMD` 工具（<https://github.com/Adobe-CEP/CEP-Resources/tree/master/ZXPSignCMD/>）对安装包进行签名、打包。

因为 `ZXPSignCMD` 只支持 Mac 和 Windows，如果 CI 里的操作系统不是 Mac 和 Windows，也就不能在 CI 中进行自动打包了。

因为 `ZXPSignCMD` 打包时会把源代码、node-modules 和 .git 等其它文件也打包进去，可以使用 `clean-release`<https://github.com/plantain-00/clean-release> 来避免把不需要的文件打包进去。

因为 nodejs 外部包的 node_modules 可能体积太大，可以使用 `prune-node-modules`<https://github.com/plantain-00/prune-node-modules> 删除不需要的文件，以减少安装包的体积。

1. 生成证书：`sudo ~/Downloads/ZXPSignCMD/ZXPSignCmd -selfSignedCert CN SH foo bar baz foo.p12`
2. 签名、打包：`sudo ~/Downloads/ZXPSignCMD/ZXPSignCmd -sign "[dir]" ${destDir}/foo.zxp ${repositoryDir}/foo.p12 baz`

对于 Mac 安装包，可以使用 dmg 安装包，签名、打包后的 zxp 文件本质是 zip 打包的文件夹，通过 unzip 解包成文件夹后，即可通过 Mac 磁盘工具的命令行工具来制作 dmg 安装包：`hdiutil create -fs HFS+ -volname foo -srcfolder ${destDir}/${dmgDirName} ${destDir}/foo.dmg`

如果需要发布到 Adobe Exchange，把打包后的 zxp 文件在 Adobe Exchange 的网页上上传即可。

## localStorage、配置文件、插件间通信

client 上可以使用 localStorage 来存储一些非敏感信息。

但不同插件之间的 localStorage 并不共用，如果需要在插件之间同步数据，对于都处于使用状态的插件，可以通过插件间通信来实时发送数据，否则可以把数据保存在用户文件夹下，例如 `~/.foo/a.json`，离线状态的插件打开时，从这个文件中读取到最新的数据。

插件间通信的数据也需要先序列化为字符串后在传输：

```ts
const csInterface = new CSInterface()

const event = new CSEvent('event name', 'APPLICATION')
event.data = JSON.stringify({ foo: 1 })
csInterface.dispatchEvent(event)

csInterface.addEventListener('event name', (value: { data: any }) => {

})
```

## 对旧版本的 PhotoShop 的支持

用旧版本 PS 打开插件时，即使有兼容性的报错，Chrome 的 devtool 上也显示不了报错信息，估计是因为旧版本 PS 打包的 Chromium 的调试协议和最新版本的 Chrome 不兼容。

解决方式是，用旧版本 PS 对应的 Chromium 来调试。

可以在这个查询打包的 Chromium 版本：<https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_9.x/Documentation/CEP%209.0%20HTML%20Extension%20Cookbook.md#chromium-embedded-framework-cef>

可以根据这个链接下载对应版本的 Chromium：<https://superuser.com/questions/920523/where-can-i-download-old-stable-builds-of-chromium-from>

对于 CSInterface，应该使用插件需要支持的最低 PS 版本对应的 CSInterface 文件。
