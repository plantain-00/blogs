# OAuth2 和供第三方调用的 SDK 设计

总体来说，都需要安全性，即要求采用 https。

它们都涉及到同第三方交互，接入功能时都会生成 id 和 secret 给第三方。

OAuth2 本质是这样一种机制，用户可以授权第三方访问自己在本站的资源（例如个人信息、头像），或代替自己在本站执行某种操作（例如发微博）。
从第三方的角度看，第三方通过 id 和 secret 获得 access_token，再通过 access_token 访问公开 API，获得 scopes 内的资源。
从用户的角度看，用户的浏览器会跳到本站域名下，如果需要登陆，则跳到登录页面登录，登陆后，如果没有授权过，或者授权范围扩大了，则跳转到授权页面授权，授权后，跳转到设置好的第三方页面，显示出第三方获得的本站资源。
这个过程中，用户可以随时选择授权，即使授权过，也可以在本站吊销对第三方网站的授权。
可以看到，用户可以意识到本站提供的授权过程。

供第三方调用的 SDK，通常只提供少量接口，没有中间的 access_token，可能是异步调用，例如支付，也可能是同步调用，例如 sms。

对于同步调用：
从第三方角度看，把接口需要的参数，以及 id 和 secret，组合起来，按照一定的加密方式，加密成签名，签名同参数一起，传递给接口，接口会返回结果。
从用户的角度看，不会直接接触到第三方页面，用户意识不到本站的这个服务。

对于异步调用：
从第三方角度看，把接口需要的参数，以及 id 和 secret，组合起来，按照一定的加密方式，加密成签名，签名同参数一起，传递给接口，接口会返回一个本站地址，浏览器跳转到这个本站地址，之后异步通知接口会收到来自本站的请求，验证签名后，执行收尾操作。
从用户的角度看，浏览器会跳转到本站页面，完成操作后，浏览器跳回第三方页面。
可以看到，用户在本站做了操作，但是没有授权过程。

对于本站来说，如果部分第三方账户被滥用，威胁其它正常账户的服务，应该及时这些异常账户。

如果提供的服务很简单，不用和用户交互，或者提供公开的数据，可以采用同步调用的方式；
如果提供的服务提供的数据比较私密，需要和用户交互，但重要性一般，或者只需要用户粗粒度的授权，不需要精确到数量，可以采用 OAuth2 的方式；
如果提高的服务提供的数据比较私密，需要和用户交互，且重要性强，或者需要用户细粒度的授权，精确到数量，可以采用异步调用并通知的方式。