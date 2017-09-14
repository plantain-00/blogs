# mysql 和 mongodb 的存储密度测试结果

数据量 | mongodb | mysql
--- | --- | ---
20k | 300MB | 3.5MB
100k | 312MB | 14.5MB
1M | 423MB | 145MB
10M | 1.5GB | 1.4GB
100M | 9.03GB | 13.6GB

+ mongodb 占用的初始空间比较大
+ mysql 的受字段类型和长度影响大
+ mongodb 的字段名也会和数据保存起来，所以字段名越长，占用的空间越大