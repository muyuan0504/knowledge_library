---
theme: channing-cyan
---
## EventLoop

js是单线程模式运行程序，为了保证其执行性能，在执行js代码的'主线程'之外，还有一个单独的线程用来维护任务队列，即"Event Loop线程"。任务队列里面的任务又分为同步任务和异步任务：主线程上通过call-stack(一个调用堆栈)来执行同步任务，异步任务不进入主线程，而进入"任务队列"，等到执行条件满足，"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行。
- `同步任务`：在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务
- `异步任务`：不进入主线程、而进入"任务队列"（task queue）的任务

不过需要注意的是：队列内存放的是回调函数，而不是整个函数本身(setTimeout, Promise...)，也就是说setTimeout()执行的是将事件的回调函数推入"任务队列"，之后由js主线程从队列中取出任务执行。

来看一段promise代码：
```js
setTimeout(() => {
    console.log(0)
}, 1000);
new Promise((resolve, reject) => {
    console.log(1)
    setTimeout(() => {
        resolve(2);
    }, 1000);
}).then((res) => {
    console.log(res);
});
console.log(4);
/** 管理台先打印1，4， 然后依次打印0, 2 */
```
代码执行过程

![Snipaste_2021-12-24_13-31-19.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6681a898e21d45c182fc45b3bffeca03~tplv-k3u1fbpfcp-watermark.image?)

参考阮一峰老师的文章：
https://www.ruanyifeng.com/blog/2013/10/event_loop.html (# 什么是 Event Loop？)

#### 扩展：宏任务与微任务
任务队列的异步任务又包括微任务(micro-task)和宏任务(macro-task), 不同的类型的任务又会放进不同的任务队列之中。

> micro-task(微任务)： <br>
> process.nextTick(Node环境), Promise.then,finally,catch以及await后面的代码, Object.observe, MutationObserver(浏览器)
> 
> macro-task(宏任务): <br>
> script(整体代码), setTimeout, setInterval, setImmediate(Node), I/O, UI rendering, requestAnimationsFrame(浏览器）


事件循环的顺序是从script开始(jscript整个都可以看做是一个宏任务)第一次循环,在一个js上下文中，先执行同步代码，执行过程中碰到macro-task就将其交给处理它的模块处理完之后将回调函数放进macro-task的队列之中，碰到micro-task也是将其回调函数放进micro-task的队列之中,直到函数调用栈清空只剩全局执行上下文.接着开始执行所有的micro-task(`同一个执行栈内，微任务先执行，宏任务丢进队列`);当所有可执行的micro-task执行完毕之后,再执行macro-task中的一个任务队列，执行完之后再执行所有的micro-task，就这样一直循环.

```
调用栈清空(可看做js全局宏任务) -> 执行所有可执行的微任务 -> 首个宏任务 -> 清空当前宏任务内可执行的所有微任务 ->  第二个宏任务 -> 清空当前阶段的所有微任务 -> ...
```

```js
/** 宏任务与微任务 */
console.log('0000');
new Promise(resolve => {
    resolve('1111')
}).then(res => {
    // 微任务
    setTimeout(() => {
        console.log(res);
    }, 1000);
}).finally(() => {
    setTimeout(() => {
        console.log('2222');
    })
});
setTimeout(() => {
    console.log('3333');
}, 1000);

console.log('4444');



// 依次打印 '1111' '4444' '2222' '3333' '1111'
```


