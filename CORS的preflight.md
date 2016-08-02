当CORS带preflight时，会发现发出了2次请求，第1次的method是OPTIONS，第2次才是实际需要的请求；
当CORS不带preflight：会发现发出了1次请求，是实际需要的请求；

从服务端角度看，如果服务端含有没有考虑cors的旧代码，应该支持preflight，这样可以兼容这些旧代码；
否则可以不带preflight，以降低请求数，从而提高性能；
CORS内的preflight的存在是为了保持服务器端的兼容性；
当服务端不支持处理OPTIONS请求时，就算是不支持preflight了。

从前端角度看，当请求的Content-Type是`application/x-www-form-urlencoded`、`multipart/form-data`或`text/plain`时，不会触发preflight，否则会触发preflight；
根据这个特性可以控制请求请求是否需要触发preflight；
jquery默认的Content-Type是`application/x-www-form-urlencoded; charset=UTF-8`，是不触发preflight的。