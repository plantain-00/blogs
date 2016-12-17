现在常见的两种API形式是：
1、命令和查询：即所有查询都是GET请求，所有命令都是POST请求，URL中用名词和动词表示查询的内容和命令的内容
2、RESTful：是一种基于资源的形式，用HTTP METHOD来表示增删改查的动作，URL中不会存在动词

API设计时也要考虑前端平台的支持度，比如某些平台只支持GET/POST，比如jsonp只支持GET。

对于RESTful形式，一般是`api.example.com`或`example.com/api/`的形式，版本号可以是`/api/v1`或`/api/user?v=1`的形式，也可以放在header中。
常见的RESTful实践是：
+ `GET` `/api/users`: 查询用户的信息，查询条件会在参数中
+ `GET` `/api/users/:id`: 查询某个ID的用户的信息
+ `GET` `/api/users/:id/books`: 查询某个ID的用户的书，查询条件会在参数中
+ `GET` `/api/users/:id/books/:id`: 查询某个ID的用户的某个ID的书

可以看出明显的层级关系，这里`GET`表示查询，可以用`POST`表示创建、获得，`PUT`表示修改、更新，`DELETE`表示删除。

+ `GET` `/api/users/:id/name`: 如果是唯一或不可数的资源，可以直接使用单数形式
+ `GET` `/api/user/books`: 查询当前用户的书，如果URL中有表示角色的词，表示当前用户作为这个角色来操作，这时需要验证身份并鉴权
+ `GET` `/api/teacher/students`: 查询当前教师的学生

当然也有纯粹的命令，不好对应到资源上来，可以考虑由于这种命令，某些对象的状态发生变化，把这种状态当成一种资源，例如：

+ `POST` `/api/user/books/:id/burnt`: 当前用户烧了某本书
+ `POST` `/api/user/books/:id/sold`: 当前用户卖了某本书

另外，RESTful用响应的status code来区分不同的结果，但是在国内，对于非https的请求，运营商可能会劫持非200的响应，所以有必要采用https，或者可以考虑放弃这样的规则，统一返回200，并在body中反映响应的结果。
