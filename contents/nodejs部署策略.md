日志策略：
代码中用 `console.log(info)` 记录日志，这样会记录在 `pm2` 的日志中；
为了避免日志文件过大，可以使用 `pm2-logrotate` 切分日志；
可以用日志工具，例如 ELK，收集、转换、查询这些日志文件，logstash 把 pm2 的日志和系统日志，转换结构后传输给 elastic search 索引保存，再通过 kibana 搜索和展示；

进程管理：
pm2

发布更新：
待发布的 js 文件发布到独立的 git 仓库中（通过 rsync 或 xcopy），在服务器上 clone 这个仓库，这样，git pull 时就更新了代码，之后再通过 pm2 restart 来重启程序；

恢复本地包：
`npm i --production`

备份和回滚：
因为本身就是 git 仓库，自带备份；
如果要回滚到上一次 commit，`git reset --hard HEAD^`；

运行监视：
程序中收集计数，通过监视程序，定时汇总，并实时显示出来；

批量管理：
对于多台机器，可以使用一些运维工具，例如 ansible，来批量执行命令；

环境变量：
可以配置在. bashrc 或. profile 等文件中，打开 bash 后会自动加载；
更新环境变量后，使用 `source` 命令加载，再通过 `pm2 restart` 使环境变量在程序中生效；

灰度发布：
指定一个节点用于灰度发布，通过 nginx 中的配置的权重控制访问量；
通过后，执行完整发布；
