# CORS 的 preflight

当 CORS 带 preflight 时，会发现发出了 2 次请求，第 1 次的 method 是 OPTIONS，第 2 次才是实际需要的请求；
当 CORS 不带 preflight：会发现发出了 1 次请求，是实际需要的请求；

从服务端角度看，如果服务端含有没有考虑 cors 的旧代码，应该支持 preflight，这样可以兼容这些旧代码；
否则可以不带 preflight，以降低请求数，从而提高性能；
CORS 内的 preflight 的存在是为了保持服务器端的兼容性；
当服务端不支持处理 OPTIONS 请求时，就算是不支持 preflight 了。

从前端角度看，当请求的 Content-Type 是 `application/x-www-form-urlencoded`、`multipart/form-data` 或 `text/plain` 时，不会触发 preflight，否则会触发 preflight；
根据这个特性可以控制请求请求是否需要触发 preflight；
jquery 默认的 Content-Type 是 `application/x-www-form-urlencoded; charset=UTF-8`，是不触发 preflight 的。