# 为 npm 包里的二进制文件增加 mirror

## 原因

很多二进制文件保存在 aws s3 上，下载慢，并且容易失败

增加 mirror 后，可以加快 CI 里 npm 包的安装速度，提高成功率

## cnpm 的 mirror

cnpm 的 mirror 了很多常用包里的二进制文件：<https://npm.taobao.org/mirrors>

## 放在 oss 上

某些包的二进制文件，cnpm 的 mirror 没有提供，可以把二进制文件下载下来，放在 oss 上

其中一部分包提供了详细的二进制文件下载说明、mirror 地址环境变量名称等，例如 sharp <http://sharp.pixelplumbing.com/en/stable/install/#pre-compiled-libvips-binaries>，按照文件操作即可

也有一部分包，虽然没有提供 mirror 文档，但依赖 node-pre-gyp 包进行二进制包的下载等操作，例如 canvas，它们的 mirror 方式是：

1. 环境变量名称：{module_name}_binary_host_mirror，其中 module_name 在 package.json 里的 binary 字段下
2. 二进制文件下载地址：{host}{remote_path}/${package_name}，其中 host、remote_path、package_name 都在 package.json 里的 binary 字段下
3. 可以在 `yarn add {foo} --verbose` 的信息中搜到下载地址，可以用作查看和验证
