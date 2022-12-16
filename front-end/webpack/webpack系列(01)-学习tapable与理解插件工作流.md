---
theme: nico
---
开启掘金成长之旅！这是我参与「掘金日新计划 · 12 月更文挑战」的第3天，[点击查看活动详情](https://juejin.cn/post/7167294154827890702 "https://juejin.cn/post/7167294154827890702")

- 前言

直接接触webpack<`vue-cli是上层封装，不在此范畴`>是因为公司当时的项目webpack版本还是3.x, 需要直接调用webpack类，当时的感受是：
1. 繁琐的文件配置，手动引入编译打包的脚本文件(开启了子线程<多页打包，多入口>去跑编译<子线程需要处理异常监听>，见下图目录child_compiler.js)；
2. 额外的环境维护开销，业务侧区分打包环境，配置隔离；

当时的webpack，配置集成度不高，没法开箱即用，编译层面的改动对开发人员来说成本较高，属实是一种折磨。<后面自己去配置webpack5版本的个人demo，体验不在一个层次，一个字，香 ! 当然从便利性上来看，`vue-cli`依然是最好的选择>

找出了之前的项目单单【编译】模块的文件目录，感受一下：

![Snipaste_2022-12-14_16-40-40.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b57dbfb7ee6e4125afeb807b32b0ebe4~tplv-k3u1fbpfcp-watermark.image?)

- 前端工程化背景下，webpack是一个绕不开的话题，自己也买了好几本前端工程化以及webpack相关的书籍，《Webpack实战：入门、进阶与调优》、《前端工程化：体系设计与实践》...读完确实有收获，但本人又不想停留在怎么更好的使用工具，妄图理解webpack的核心实现，又缺乏明确的引导，一直没有动力去拆解自己的学习目标；于是某一天，我去尝试了解tapable这个库，去理解钩子函数是什么，带着想深入了解的念头，我开始尝试去分析它。<其实webpack官网对tapable以及插件与打包机制都有做引导性介绍，是平时忽略了>

https://webpack.docschina.org/api/plugins/
![Snipaste_2022-12-14_17-20-02.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b234db43f1914724b82e94f870bdce4c~tplv-k3u1fbpfcp-watermark.image?)

- 工欲善其事，必先利其器。想深入理解webpack,不妨先好好认识下tapable。

## tapable
学习tapable可以帮助我们更好的理解webpack的插件工作流，那么tapable提供了哪些钩子类型函数呢，我们一个个来分析。

```
## 新建文件夹
- npm init -y
- npm install tapable --save
## 新建index.js
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook,
} = require('tapable');
## 开始操练
```

### SyncHook(同步钩子)

最基本的钩子函数,对于同步钩子函数，只能通过tap注册插件函数，并且通过.call自上而下同步执行tap添加过的插件回调函数。

```
const { SyncHook } = require('tapable');
const userInfo = new SyncHook(['name', 'gender']);

userInfo.tap('plugin1', (name, gender) => {
    console.log(name, gender); // 'jimous man'
    return 'he is cool';
});
userInfo.tap('plugin2', (name) => {
    console.log(name); // 'jimous'
});

userInfo.call('jimous', 'man');
```

### SyncBailHook(同步保险钩子)

SyncBailHook钩子类型的特点是如果有一个注册函数返回了非undefined值，那么后面的插件函数不执行(熔断)。

```
const { SyncBailHook } = require('tapable');
const userInfo = new SyncBailHook(['name', 'gender']);

userInfo.tap('plugin1', (name, gender) => {
    console.log('plugin1', name, gender); // 'plugin1 jimous man'
    return; // 隐式return undefined，所以该return被ignore
});
userInfo.tap('plugin2', (name) => {
    console.log('plugin2', name); // 'plugin2 jimous'
    return 0; // 显示return 0; 所以后续plugin3注册函数不会执行
});

userInfo.tap('plugin3', (name, gender) => {
    console.log('plugin3', name, gender);
});

userInfo.call('jimous', 'man');
```

### SyncWaterfallHook(同步瀑布流钩子)

SyncWaterfallHook钩子类型的特点是如果前一个注册函数返回了非undefined的值，那么该值会被当做第一个参数传递给下一个注册函数的第一个参数。
```
const { SyncWaterfallHook } = require('tapable');
const userInfo = new SyncWaterfallHook(['name', 'gender']);

userInfo.tap('plugin1', (name, gender) => {
    console.log('plugin1', name, gender); // 'plugin1 jimous man'
    return; // 隐式返回undefined,plugin2函数接收的第一个参数还是'jimous'
});
userInfo.tap('plugin2', (result, res) => {
    /** result接收上一次调用函数的返回值，可通过...res接收剩余参数 */
    console.log(result, res); // 'plugin1 man'
    return 'plugin2'; // 返回值plugin2传递给plugin3函数
});

userInfo.tap('plugin3', (result, res) => {
    /** result接收上一次调用函数的返回值，可通过...res接收剩余参数 */
    console.log(result, res); 'plugin2 man'
});

userInfo.call('jimous', 'man');
```

### SyncLoopHook(同步循环钩子)

SyncLoopHook钩子类型的特点是如果有一个注册函数的返回值为非undefined,那么整个hook实例会从第一个plugin开始全部重新调用，知道所有的注册函数返回值均为undefined。
```
const { SyncLoopHook } = require('tapable');
const userInfo = new SyncLoopHook(['name', 'gender']);
let index = 3;
let index2 = 0;

userInfo.tap('plugin1', (name, gender) => {
    console.log('重新打印了吗'); // 当plugin2显式return index2，从第一个plugin开始重新调用
    index--;
    if (index > 0) {
        console.log('plugin1', name, gender);
        // 这里当index < 0的时候，才调用plugin2
        return index;
    }
});
userInfo.tap('plugin2', (result, ...res) => {
    index2++;
    if (index2 < 3) {
        console.log('plugin2', result, res);
        return index2;
    }
});

userInfo.call('jimous', 'man');
```

**至此，同步类型钩子已经都介绍完了，需要注意的是，对于同步类型钩子，只能通过tap来注册插件函数，异步类型钩子额外支持`tapAsync`, `tapPromise`这两个注册方式，异步插件函数通过调用callback参数来告诉 `Hook` 它这一个异步任务执行完成了**

### AsyncParallelHook(异步并行钩子)

*parallel:平行（的）；极相似的；同时发生的；相应的*

AsyncParallelHook钩子类型调用的时候接收一个回调函数，注册插件函数的时候，第二个参数接收一个callback，并且需要在插件函数内部调用它，当所有的插件函数内的callback均被调用，那么.callAsync调用该hook时注册的回调函数会触发。
```
const { AsyncParallelHook } = require('tapable');
const userInfo = new AsyncParallelHook(['name']);
// new AsyncParallelHook参数可以不传，不传的时候插件函数第一个参数即callback

userInfo.tapAsync('plugin1', (name, cb) => {
    setTimeout(() => {
        console.log('plugin1', name);
        cb(null, 'plugin1');
    }, 5000);
});

userInfo.tapAsync('plugin2', (name, cb) => {
    setTimeout(() => {
        console.log('plugin2', name);
        cb(null, 'plugin2');
    }, 3000);
});

userInfo.tapAsync('plugin3', (name, cb) => {
    setTimeout(() => {
        console.log('plugin3', name);
        cb(null, 'plugin3');
    }, 1000);
});

userInfo.callAsync('jimous', (err, result) => {
    console.log('执行完毕', err, result); // 执行完毕 undefined undefined
});
// 依次根据setTimeout倒计时打印plugin3->plugin2->plugin1的console，之后打印'执行完毕'
// 如果有插件函数的callback参数未调用，那么不会执行最终的回调函数。
```

### AsyncParallelBailHook(异步并行保险钩子)

AsyncParallelBailHook钩子类型调用的时候传入回调函数，当第一个插件注册的钩子执行结束后，会进行bail(熔断), 然后会调用最终的回调，无论其他插件是否执行完。
```
const { AsyncParallelBailHook } = require('tapable');
const userInfo = new AsyncParallelBailHook();

userInfo.tapAsync('plugin1', (cb) => {
    cb(null, 'plugin1'); // 如果在这里直接cb(null, val),那么，不会往后执行plugin2, plugin3
    setTimeout(() => {
        console.log('plugin1');
        cb(null, 'plugin1');
    }, 1000);
});

userInfo.tapAsync('plugin2', (cb) => {
    setTimeout(() => {
        console.log('plugin2');
        cb(null, 'plugin2');
    }, 3000);
});

userInfo.tapAsync('plugin3', (cb) => {
    setTimeout(() => {
        console.log('plugin3');
        cb(null, 'plugin3');
    }, 5000);
});

userInfo.callAsync((err, result) => {
    console.log('执行完毕', err, result);
});

// 依次打印： plugin1 -> 执行完毕 null plugin1 -> plugin2 -> plugin3
```

### AsyncSeriesHook(异步串行钩子)

AsyncSeriesHook钩子类型的特点是串行执行，会等待前一个异步操作完成
```
const { AsyncSeriesHook } = require('tapable');
const userInfo = new AsyncSeriesHook();

userInfo.tapAsync('plugin1', (cb) => {
    setTimeout(() => {
        console.log('plugin1');
        cb(); // 当上面调用过callback并传入有效值，会执行一次最终的回调，这里在callback不传参，又会调用一次最终的回调，并且后续的插件函数能正常执行。。
    }, 5000);
});

userInfo.tapAsync('plugin2', (cb) => {
    setTimeout(() => {
        console.log('plugin2');
        cb();
    }, 3000);
});

userInfo.tapAsync('plugin3', (cb) => {
    setTimeout(() => {
        console.log('plugin3');
        cb(null, 'plugin3');
    }, 1000);
});

userInfo.callAsync((err, result) => {
    console.log('执行完毕', err, result);
});
```

### AsyncSeriesBailHook(异步串行保险-熔断钩子)

AsyncSeriesBailHook钩子类型的特点相当于是将异步串行化的SyncBailHook钩子函数，当异步操作的callbak传入有效值，后续插件函数不会调用
```
const { AsyncSeriesBailHook } = require('tapable');
const userInfo = new AsyncSeriesBailHook();

userInfo.tapAsync('plugin1', (cb) => {
    setTimeout(() => {
        console.log('plugin1');
        cb();
    }, 5000);
});

userInfo.tapAsync('plugin2', (cb) => {
    setTimeout(() => {
        console.log('plugin2');
        cb(null, 'haha'); // 到这里就结束了后续插件的调用
    }, 3000);
});

userInfo.tapAsync('plugin3', (cb) => {
    setTimeout(() => {
        console.log('plugin3');
        cb(null, 'plugin3');
    }, 1000);
});

userInfo.callAsync((err, result) => {
    console.log('执行完毕', err, result);
});
```

### AsyncSeriesWaterfallHook(异步瀑布流钩子)


```
const { AsyncSeriesWaterfallHook } = require('tapable');
const userInfo = new AsyncSeriesWaterfallHook(['name']);

userInfo.tapAsync('plugin1', (name, cb) => {
    setTimeout(() => {
        console.log('plugin1:', name);
        cb(null, 'from plugin1');
    }, 5000);
});

userInfo.tapAsync('plugin2', (name, cb) => {
    setTimeout(() => {
        console.log('plugin2:', name);
        cb();
    }, 3000);
});

userInfo.tapAsync('plugin3', (name, cb) => {
    setTimeout(() => {
        console.log('plugin3:', name);
        cb(null, 'plugin3--end');
    }, 1000);
});

userInfo.callAsync('jimous', (err, result) => {
    console.log('任务全部执行完毕:', err, result);
});
// 依次打印：plugin1: jimous -> plugin2: from plugin1 -> plugin3: from plugin1 -> 任务全部执行完毕: null plugin3--end
```
同理这里用tapPromise实现如下：

```
userInfo.tapPromise('plugin1', (name) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('plugin1');
            resolve('from plugin1');
        }, 5000);
    });
});

userInfo.tapPromise('plugin2', (name) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('plugin2', name);
            resolve();
        }, 3000);
    });
});

userInfo.tapPromise('plugin3', (name) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('plugin3', name);
            resolve('from plugin3');
        }, 1000);
    });
});

userInfo.promise('jimous').then((res) => {
    console.log(res, '执行完毕');
});
```

## 基于tapable实现插件流

现在我们对tapable已经有了一个整体的认识，知道了钩子有不同的类型
1. 代码执行顺序，可以分为同步和异步；
2. 功能上，有保险钩子(提供熔断能力), 瀑布流钩子(允许传递参数),循环钩子，异步执行下的串行钩子

知道有这些能力以后，我们能做些什么呢？既然是插件工作流，想到了小时候写日记时的流水账，那么就以记录一天的流水账来看看如何怎么利用这些钩子函数。

于是为了更好的理解插件流工作流程，我用代码实现了一个简陋生活时间流来理解代码运行的过程：

```
/** 构建工作流 */
const {
    SyncHook,
    SyncBailHook,
    SyncWaterfallHook,
    SyncLoopHook,
    AsyncParallelHook,
    AsyncParallelBailHook,
    AsyncSeriesHook,
    AsyncSeriesBailHook,
    AsyncSeriesWaterfallHook,
} = require('tapable');

/** 会被打断的动作，需要用bailHook进行处理 */
class DayUse {
    static isPlaying = false;
    constructor(options) {
        this.options = options;
        this.hooks = {
            eat: new AsyncSeriesHook(['food']), // 异步串行
            work: new AsyncSeriesBailHook(), // 异步串行-保险
            sleep: new SyncHook(['dark']), // 睡觉不被打扰，同步处理
            read: new SyncBailHook(['book']), // 看书可能会被打断
            play: new AsyncSeriesBailHook(['game']), // 玩游戏会被打断
        };
    }
    oneDayBegin() {
        /** 美好的一天从干饭开始！ */
        this.hooks.eat.tapAsync('breakfast', (food, cb) => {
            this.workPlan();
            console.log(this.options.wakeup, '早餐时间---', food);
            let workTime = 6;
            const timeUse = setInterval(() => {
                if (workTime === 0) {
                    clearInterval(timeUse);
                    cb();
                }
                workTime--;
                console.log('one hour later~');
            }, 1000);
        });
        this.hooks.eat.tapAsync('lunch', (food, cb) => {
            console.log('午餐时间---', food);
            cb();
        });
        this.hooks.eat.tapAsync('dinner', (food, cb) => {
            console.log('晚餐时间---', food);
            cb();
        });

        this.hooks.eat.callAsync('food', (result) => {
            console.log(this.options.sleep, '关灯睡觉, 美好的一天结束了❤❤', result);
        });
    }
    /** 工作流程 */
    workPlan() {
        // four hour work
        let codingFlag = false;
        this.hooks.work.tapAsync('coding-work1', (cb) => {
            if (!codingFlag) {
                console.log('happy coding time ~~');
                codingFlag = true;
            }
            setTimeout(() => {
                console.log('coding finished ~~');
                cb();
                // cb('开始摸鱼···');
            }, 4000);
        });
        // two hour摸鱼
        this.hooks.work.tapAsync('coding-work2', (cb) => {
            console.log('进入摸鱼状态');
            cb();
        });
        this.hooks.work.callAsync(() => {
            console.log('哥哥好会写代码哦~~~');
        });
    }
    readPlan() {}
    relaxPlan() {}
    start() {
        console.log('新的一天开始了');
        this.oneDayBegin();
    }
}

const oneDay = new DayUse({
    wakeup: '06:00',
    sleep: '22:00',
});

oneDay.start();

```
运行结果如下：

![Snipaste_2022-12-15_15-27-44.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ecb4fa36de54bac9d0b52b96ce9d9ce~tplv-k3u1fbpfcp-watermark.image?)

接着我们扩展一下，实现插件流程，模拟webpack的插件扩展写法，我们需要提供一个类或者构造函数，提供apply方法，接收compiler<钩子生产函数，即对应上例的DayUse类>，并将对应钩子挂载注册函数：
```
// 首先在new实例的时候提供plugins配置
const oneDay = new DayUse({
    ...
    plugins: [new playPlugin()],
});

// 实例化的时候需要调用插件注册回调函数
class DayUse {
  constructor(options) {
    ...
    this.options.plugins.length &&
        this.options.plugins.forEach((hook) => {
            hook.apply(this);
        });
  }
  ...
}
```
接着我们实现我们的play插件 

```
class playPlugin {
    constructor(options) {}
    apply(compiler) {
        compiler.hooks.play.tapAsync('lol', (cb) => {
            console.log('lol------play');
            setTimeout(() => {
                cb();
            }, 2000);
        });
        compiler.hooks.play.tapAsync('jx3', (cb) => {
            console.log('jx3------play');
            setTimeout(() => {
                cb('饭点了, 不玩了');
            }, 1000);
        });
        compiler.hooks.play.tapAsync('watchTv', (cb) => {
            console.log('Tv------play');
            cb();
        });
    }
}
```
将时间注册到午餐时间吧，并将调用函数封装到relaxPlan函数中

```js
this.hooks.eat.tapAsync('lunch', (food, cb) => {
    console.log('午餐时间---', food);
    this.relaxPlan();
    let playTime = 4;
    const timeUse = setInterval(() => {
        if (playTime === 0) {
            clearInterval(timeUse);
            cb();
        }
        playTime--;
    }, 1000);
});

relaxPlan() {
    console.log('开始打游戏~~');
    this.hooks.play.callAsync((result) => {
        console.log(result);
    });
}
```
然后运行一下：

![企业微信截图_16710907435503.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f25edf10c2c4c3db73839ea2608156c~tplv-k3u1fbpfcp-watermark.image?)

到这里，就实现了简单的可提供插件的工作流，[github完整代码](https://github.com/jimouspeng/tapable)，有兴趣的读者可以自己试试构建下工作流。

到此，我们已经知道tapable支持的钩子类型，也实现了简单的插件工作流，那么webpack又是怎样利用这些钩子实现自己的插件工作流，我们又能基于这种插件流在webpack编译阶段做些什么呢？实现了自己工作流后，相信大家都会有自己的思考。



