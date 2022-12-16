<!--
 * @Author: jimouspeng
 * @Date: 2022-12-16 11:42:24
 * @Description: 
 * @FilePath: \knowledge_library\front-end\tapable\webpack
-->
---
theme: nico
---
开启掘金成长之旅！这是我参与「掘金日新计划 · 12 月更文挑战」的第4天，[点击查看活动详情](https://juejin.cn/post/7167294154827890702 "https://juejin.cn/post/7167294154827890702")

在了解了tapable，熟悉了插件工作流的机制之后，重新回到webpack本身，对于它提供的各种钩子的使用会更加得心应手，现在，我们来尝试自己实现一个webpack插件，来看看我们能在webpack的编译中做点什么。

本文源码展示对应webpack版本-`webpack@5.75.0`

>先介绍两个概念：`Compiler`，`compilation`

### webpack提供的钩子扩展
- Compiler类钩子

Compiler类钩子覆盖了webpack编译声明周期(`environment -> beforeRun -> run -> beforeCompile -> compiler -> make -> afterCompile -> done` )，从配置解析，执行编译，到输出(emit)产物，针对的是webpack层面，负责整个编译流程的宏观任务。

比如compile钩子：

>![Snipaste_2022-12-15_19-45-51.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3d2447f514844c1b8de9af3452d457cf~tplv-k3u1fbpfcp-watermark.image?)

看到`SyncHook`,是不是很眼熟，没有错，就是tapable钩子对应的同步钩子, 当了解过tapable的用法之后，再回过来看待webpack的钩子，对于其钩子类型的使用，就容易理解和上手。

- Compilation类钩子

与compiler钩子不同，compilation钩子对应的是模块的具体编译过程，主要处理Chunk、Module，module -> chunks的工作流程，属于构建层面。

- Compilation对象

Compilation指向当前模块编译实例，我们可以通过compilation对象进行例如动态的添加模块，注册不同编译阶段的回调函数以及获取compilation实例的一些属性等操作。

webpack run -> 创建compile实例 -> 创建compilation实例，执行编译 -> compile编译周期结束，输出产物

### 如何开发一个自定义插件
- 明确插件功能

首先我们要明确我们想要做什么，然后再确定在编译的什么阶段去处理。举个例子：我们想要替换我们的打印字符串

`console.log('[zhanwei] is cool;');`

将[zhanwei]替换为别的我们想要的文字。

- 开发逻辑
1. 如果要替换占位符，那么一定是资源构建结束，我们可以选在emit阶段(输出 asset 到 output 目录之前执行);
2. 如果获取assets的源码呢，可以参考webpack专有的source库 < [webpack-sources](https://github.com/webpack/webpack-sources#source) >

代码展示如下：
```js
class pluginReplace {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('emit', (compilation, cb) => {
            console.log(Object.keys(compilation));

            const assets = compilation.assets;

            let fileContent = '';
            Object.keys(assets).forEach((key) => {
                if (/js$/.test(key)) {
                    const sourceCode = assets[key].source();
                    fileContent = sourceCode.replace(/\[zhanwei\]/g, 'muyuan ~~');
                }
            });
            /** 更改输出文件 */
            compilation.assets['main.js'] = {
                source() {
                    // 定义文件的内容
                    return fileContent;
                },
                size() {
                    // 定义文件的体积
                    return Buffer.byteLength(fileContent, 'utf8');
                },
            };
            cb();
        });
    }
}

exports.pluginReplace = pluginReplace;
```
webpack为开发者提供了丰富的扩展钩子，如果想更加深入了解，可以自行跑demo对每个钩子的回调输出看看打印出来是什么。同时因为其丰富的扩展性和插件的可支持度，源码阅读有一定理解成本，从时间和阅读成本考虑，深入具体钩子模块的模块源码实现之前，能从工具库设计层面去理解webpack本身的插件工作机制，也许会是一个更好的选择。

