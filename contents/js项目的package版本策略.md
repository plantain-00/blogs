#### 发布到npm的package的版本号应该是什么？

总体上，版本号应该遵循semver（Semantic Versioning，主版本号.次版本号.修订号）的规则。具体来说：

+ 第一次发布，版本号是1.0.0
+ 如果有不兼容的API修改，主版本号增加1，次版本号和修订号都是0。例如2.0.0
+ 如果没有不兼容的API修改，如果增加了新功能，主版本号不变，次版本号增加1，修订号是0。例如2.1.0
+ 如果没有不兼容的API修改，也没有增加新功能，只是做了问题修复，主版本号和次版本号不变，修订号增加1。例如2.1.1

#### 为项目新增加了一个依赖，是放在dependencies下，还是devDependencies下？

总体上，dependencies下应该放置运行时的依赖；devDependencies下应该放置开发时的依赖。具体来说：

+ 如果是nodejs程序，或者CLI程序，程序运行时的依赖包放到dependencies下，程序运行时不依赖的包放到devDependencies下。例如，一个网站后端，`express`应该防在dependencies下，而`@types/express`和`typescript`应该放在devDependencies下
+ 如果是前端程序，因为程序运行时不会依赖node_modules内的包，所以应该把所有的依赖都放到devDependencies下。例如，一个网站前端，`react`应该放在devDependencies下
+ 如果是库，安装这个库时也需要安装的依赖包放到dependencies下，安装这个库时不需要安装的依赖包放到devDependencies下。例如，一个express中间件，`express`和`@types/express`应该防在dependencies下，而`typescript`应该放在devDependencies下

#### dependencies下package的版本号应该是什么形式？

总体上，应该在保证不会出现因为依赖更新导致程序失败的基础上，含括尽可能多的依赖版本。具体来说：

+ 如果是nodejs程序，或者CLI程序，为了稳定性，包的版本形式可以是`"x.y.z"`
+ 如果是库，应该尽可能和其它库复用依赖，如果某个包在`x.y.0`下正常工作，在`x.{y-1}.z`下不能正常工作（可以查看changelog，一般是`x.y.0`时加入了某些使用到的功能），这个包的版本形式应该是`"^x.y"`（如果y是0，可以简化为`"x"`），表示`[x.y.0, {x+1}.0.0)`内的所有包都会支持
+ 如果是一些经常打破semver的库（例如@types下的几千个库），为了稳定性，包的版本形式应该是`"x.y.z"`
+ 如果包的主版本号是0，说明这个包还不稳定，API很可能会变，为了稳定性，包的版本形式应该是`"x.y.z"`

#### devDependencies下package的版本号应该是什么形式？

为了稳定性，包的版本形式应该是`"x.y.z"`
