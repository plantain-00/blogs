# lerna 项目的 CI 优化

用 lerna 管理的 monorepo 项目形式，相比多仓库的项目形式，带来了很多好处，也引起了一些缺点。

其中一个就是，当 package 变多时，CI 内还是会完全 build 所有 package，导致 build 时间变长。

一个直观的优化方案是，只对作了修改的 package 执行 build / lint / test 即可。

## lint 的优化方案

+ 可以并行执行 lint 和 build / test
+ 只对作了修改的 package 执行 lint 即可
+ 可以并行执行各个 package 的 lint，可以通过 `lerna run lint --parallel --scope package-a --scope package-b` 来实现

## build 和 test 的优化方案

build 和 test  过程的情况要复杂一些，例如 `package-a` 依赖 `package-b`，`package-b` 依赖 `package-c`

如果 `package-b` 里有代码改动，需要先 build `package-c`，再 build `package-b`；而且 test `package-b` 后，也需要 test `package a`，所以 `package-a` 也需要 build

+ 对作了修改的 package 需要执行 build 和 test
+ 对作了修改的 package 的依赖 packages 和被依赖 packages 都需要执行 build
+ 对作了修改的 package 的被依赖 packages 都需要执行 test
+ 执行 `lerna updated` 后返回获得的是修改的 package 和被依赖 packages
+ 通过递归读取 package 里的 `package.json` 里的 `dependencies`, `devDependencies` 和 `peerDependencies`，获得依赖 packages
+ 通过 `lerna run build --scope package-a --scope package-b --scope package-c` 来执行 build
+ build 完成后，通过 `lerna run test --parallel --scope package-a --scope package-b` 来执行 test，注意可以并行执行 test 的
+ 如果执行过 `lerna version`，`lerna updated` 会返回空结果，作了修改的 package 可以通过下面的 `npm view` 来获得
+ 进一步的优化是，作了修改的 package 的依赖 packages 不执行 build，而是删除对应的代码后执行 `lerna bootstrap`，这时这些依赖 packages 会当作外部依赖包被安装，也就避免了这些包的 build 过程

## 在 CI 中进行 package 自动发布

+ 一般在 build, lint 和 test 后执行
+ 一般只在 tag 上或 master 分支上开启，tag、分支名、commit message 可以在 CI 的环境变量中拿到
+ 可以通过 `npm view @foo/bar versions` 来获得 package 已经发布的所以版本，如果 `package.json` 里的版本没有发布，或者错误消息里包含 `404 Not Found`（说明这个 package 还没有发布过），就通过执行 `cd ./packages/bar && npm publish` 来发布
