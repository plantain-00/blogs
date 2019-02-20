# 权限设计

#### 数据模型

比较灵活的方案是，增加 “角色” 来解藕 “用户” 和“权限”，即 “用户” 多对多 “角色”，“角色” 多对多“权限”。

确定 “角色” 时，可以类比组织内的职务。

“权限”的结构，可以是简单的列表，也可以是树结构，一般 “父权限” 可以对应某资源的 “查看” 权限，它的 “子权限” 对应该资源的 “修改”、“删除” 等操作，因为这些操作都基于 “查看” 权限。

对于树结构的 “权限”，传统数据库可以通过一列“父权限 ID” 的方式来保存。

因为一般 “角色” 和“权限”数据不会很大，一般可以永久存放在缓存或者内存中，数据库中的数据更新后，通过消息传递给程序，程序再更新缓存或内存中的 “角色” 和“权限”数据。

确定数据模型后，再确定相应的存储模型，设计好数据库。

#### 身份验证

首先是 “载体” 问题，如果要支持移动 APP，一般采用 token 而不是 session 的形式，因为移动 APP 一般不像浏览器那样内置使用 cookie，而 session 需要客户端支持 cookie。

客户端在请求中加入 token，服务端根据 token 确定是那个用户。

#### 鉴权

确定用户后，后端负责确定此用户有没有此请求的权限，也就是 “鉴权” 过程。

一般是根据用户 ID，查询有哪些角色，再根据这些角色，查询有哪些权限，再合并、去重、缓存，如果查到的权限集合中包含了此请求的权限，开始执行具体的业务，负责直接返回 403 错误

#### 前端控制

前端控制不是为了安全，是为了提高用户体验，让用户一目了然自己可以有哪些操作，避免了用户进行未授权的操作时，弹出烦人的错误提示。

前端控制，可以是把未授权的操作入口隐藏掉，也可以是把未授权的操作入口 disable 掉。

用户登录后，服务端不止要返回 token，也要返回此用户的权限列表（或权限树），这样，前端就可以根据这个权限列表或权限树，隐藏或 disable 掉未授权的权限了。

#### nestjs 的权限设计

首先是资源标记，nestjs 里可以在下面几个地方标记资源

+ controller class
+ controller method (GET POST 等等)
+ resolver class
+ resolver method (Query Mutation Subscription)

用于标记的装饰可以是

```ts
import { ReflectMetadata } from '@nestjs/common'

const ResourceName = (name: string) => ReflectMetadata('resourceName', name)
```

使用 nestjs 的全局 Guard 来做鉴权，先判断请求的资源名称

```ts
const resourceName = this.reflector.get<string>('resourceName', context.getHandler()) || this.reflector.get<string>('resourceName', context.getClass())
```

method 上的资源名称优先级大于 class 上的资源名称

如果没有资源名称，则说明是不可访问的资源，鉴权失败

然后根据方法上的 `@GET` `@POST` `@Query` 等装饰，识别资源的操作，例如读、写

```ts
const resolverType = this.reflector.get<'Query' | 'Mutation' | 'Subscription' | undefined>('graphql:resolver_type', context.getHandler())
const requestMethod = this.reflector.get<'GET' | 'POST' | 'PUT' | 'DELETE' | undefined>('method', context.getHandler())
// 查询有没有 @ResolveProperty() 装饰，这个装饰是用于嵌套属性查询，所以等同于 Query
const isResolveProperty = this.reflector.get<boolean>('graphql:resolve_property', context.getHandler())
```

如果没有资源操作，则说明是不可访问的资源，鉴权失败

然后获取当前请求

```ts
const req = isGraphqlRequest
  ? GqlExecutionContext.create(context).getContext<ResolverContext>().req // resolver
  : context.switchToHttp().getRequest<Request>() // controller
```

最后根据当前请求携带的用户信息作鉴权

除了使用全局 Guard，更复杂的鉴权需求，可以通过在请求处理方法中抛出异常来达到，例如`throw new HttpException('need login', 403)`

例外，对于 `login` 这样不要求验证身份的接口，可以认为资源名称是 `public`，并让这个资源不需要登录也能访问
