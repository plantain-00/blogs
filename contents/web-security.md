# web安全总结

### 浏览器

#### 子资源完整性检查（Subresource Integrity, SRI）

较新的浏览器支持 SRI，即在 script 或 link 标签上增加 integrity 属性后，浏览器在执行前，会先计算子资源的 hash，并与 integrity 属性的值比较是否一致，如果不一致，浏览器则认为此资源已被污染，不会执行，从而避免资源文件被第三方 CDN 等修改产生的安全问题

### Content-Security-Policy Header(CSP)

较新的浏览器支持 CSP 头检查，包括是否允许 eval 操作、js / css 内联、限制 js / css / img / font 来源域名，从而避免 XSS 和 js 注入攻击

### X-XSS-Protection Header

较新的浏览器支持 X-XSS-Protection 头，支持 XSS 过滤，从而避免 XSS 攻击

### X-Frame-Options Header

较新的浏览器支持 X-Frame-Options 头，可以让浏览器避免把本页面作为其它网站的 frame 源，从而避免网站的 js 执行权限被其它网站通过 frame 的方式获得

### 通信协议

#### https

通信加密，避免内容被中间的网络供应商等获取、修改

### 浏览器端开发

用户的内容：包括输入框等表单输入、URL地址（参数、hash）、从服务端接收的其他用户的数据

#### 用户的内容在 html 中的展示前，要进行 html 转义

避免 js 执行权限泄漏

#### 用户的内容不能被当成 js 来执行

避免 js 执行权限泄漏

#### 用户的内容中的第三方链接和图片打开时，不要附带 cookie 和 token

避免 cookie 和 token 泄漏

#### 不要手工拼接 json, html, js，使用库或者安全的模版

避免 js 执行权限泄漏

### 服务端开发

#### secure & httpOnly cookie

某个 cookie 被设置为 httpOnly 后，将不会在浏览器中通过 `document.cookie` 的方式查到，所以即使浏览器端的 js 执行权限被人拿到，cookie 也不会丢失

某个 cookie 被设置为 secure 后，发送的 `http://domain.com` 请求将不会包含这个 cookie，从而避免了 cookie 通过非 https 的方式被泄漏

#### http 请求跳转到 https

堵死非安全的通信方式

#### 鉴权、数据验证

避免有人绕过浏览器端的鉴权、数据验证，直接构造请求，导致的权限泄漏、非法操作

#### 密码 bcrypt 存储

机制上保证，只能检查密码是否正确，不能还原出原始密码，避免数据库泄漏后，用户的密码被泄漏，避免使用了相同密码的其它网站的密码泄漏

#### 强制用户使用长密码，不强制使用大小写、特殊符号，不强制定期修改密码

太复杂的密码容易变成一次性密码，用户会频繁找回，鼓励用户使用个性化的多个单词、拼音的组合密码

#### 用户登出或修改密码后，要保证此用户所有的 session 和 token 都失效

避免用户密码泄漏后，已修改密码，或在公共机器上下线，但不安全的 session 或 token 仍然有效导致的安全问题

#### 有副作用的接口不能开放 GET 请求

避免 CSRF 攻击

#### 为接口的访问增加频率限制

避免机器人耗用太多资源

#### 使用参数化查询

避免 SQL 注入

#### 谨慎开启 CORS，设置允许的域名、http method、header

CORS 突破了浏览器的同源策略，不加限制时，会让第三方网站也有发起跨域请求的能力
