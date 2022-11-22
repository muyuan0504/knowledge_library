---
theme: nico
---
开启掘金成长之旅！这是我参与「掘金日新计划 · 12 月更文挑战」的第1天，[点击查看活动详情](https://juejin.cn/post/7167294154827890702 "https://juejin.cn/post/7167294154827890702")


首先我们定义自己的MyPromise类，参考Promise对象，它拥有以下属性：
```js
class MyPromise {
    constructor() {
    }
    then() {}
    catch() {}
    finally() {}
    static resolve() {}
    static reject() {}
    static all() {}
    static any() {}
    static race() {}
    static allSettled() {}    
}
```
##### `new Promise()`

接着我们来看new Promise()的时候，内部的处理逻辑：
```
new Promise( (resolve, reject) => {} )
```
1. 接收一个函数类型的参数，该函数接收两个类型为函数的参数；
2. 当前Promise实例(P)的状态通过绑定resolve和reject回调执行，并将P的结果值作为参数回调给对应的状态处理函数，即resolve(P.value) / reject(P.value)；

MyPromise实现如下：

```js
class MyPromise {
    constructor(handler) {
        this._value = undefined;
        this.status = 'pendding';
        // 通过绑定this，确保resolve,reject的参数一定指向当前Promise的_value
        const resolveHandle = this.resolve.bind(this);
        const rejectHandle = this.reject.bind(this);
        handler(resolveHandle, rejectHandle);
    }
    resolve(val) {
        this._value = val;
        this.status = 'fulfilled';
    }
    reject(val) {
        this._value = val;
        this.status = 'rejected';
    }
}

const promiseOrigin = new Promise((resolve, reject) => {
    resolve(1);
});
const promiseMine = new MyPromise((resolve, reject) => {
    resolve(1);
});
console.log(promiseOrigin, '------promiseOrigin-------', promiseMine);
// Promise {<fulfilled>: 1}[[Prototype]]: Promise
// '------promiseOrigin-------'
// MyPromise {_value: 1, status: 'fulfilled'}
```
注意这里处理resolve,reject需要绑定this指向，同时不建议使用箭头函数，因为箭头函数的this只跟上下文绑定，当我们new操作符实例化MyPromise类的时候，this隐式绑定到window上，而通过.bind可以确保对于当前resolve/reject的函数调用主体一定是当前Promise.

##### `.then(onFulfilled, onRejected?)`

Promise是如何实现链式调用，我们先看看Promise的.then内部实现：
1. 接收两个函数类型的参数
- 当前Promise状态从pendding -> fulfilled状态时，执行onFulfilled回调函数，并将当前Promsie值作为参数；
- 当前Promise状态从pendding -> rejected状态时，执行onRejected,并将当前Promsie rejected的值作为参数；
2. 如果非函数类型，onFulfilled会在内部被替换为 (x) => x，onRejected会在内部被替换为一个 "Thrower" 函数
3. 同时返回一个pending状态的新的promise(P), P的状态和值由.then的回调函数的返回值决定

```js
then(onFulfilled, onReject) {
    const { status, _value } = this;
    return new MyPromise((resolveNext, rejectNext) => {
        // #TODO function penddingHandle() {}
        function penddingHandle() {}
        function resolveHandle() {
            const nextValue = onFulfilled(_value);
            if (nextValue instanceof MyPromise) {
                nextValue.then(resolveNext, rejectNext);
            } else {
                resolveNext(nextValue);
            }
        }
        function rejectHandle() {
            const nextValue = onReject(_value);
            if (nextValue instanceof MyPromise) {
                nextValue.then(resolveNext, rejectNext);
            } else {
                rejectNext(nextValue);
            }
        }
        switch (status) {
            case 'pendding':
                penddingHandle();
                break;
            case 'fulfilled':
                resolveHandle();
                break;
            case 'rejected':
                rejectHandle();
                break;
            default:
                break;
        }
    });
}
```
`.then异步`：

目前我们的MyPromise已经可以正常通过.then往后传递参数，如果new Promise()内执行了异步逻辑，.then能拿到正确的值吗？目前的代码显然是不能的，.then函数内部我们还有pending状态的还未处理

那么我们的问题就变成了：

- 怎么解决异步代码Promise状态的变更，以及执行对应的回调

当遇到异步执行的代码，Promise的状态从pending流转到最终结果前处于waiting状态，在此期间.then接受的回调函数以及后续函数，需要等待Promise结果之后执行，为了解决这个问题，我们为MyPromise类创建了resolved结果对应的任务队列(后面称作`resolveTasklist`)以及rejected结果对应的任务队列(后面称作`rejectTasklist`)，等待当前Promise状态流转后，将任务队列取出执行，并将当前Promise的结果值传入。

```js
new MyPromise((resolve, reject) => { // 记作Promise0
    setTimeout(() => { // 记作setTimeout1
        resolve(1);
    }, 1000);
})
    .then(  // 隐式返回Promise1
    (res) => { // 记作resolve1
        console.log(res, 'then0-----');
        return res * 2;
    })
    .then(  // 隐式返回Promise2
    (res) => { // 记作resolve2
        console.log(res, 'then1-----');
        return new MyPromise((resolve, reject) => { // promiseNew
            setTimeout(() => { // // 记作setTimeout1
                resolve(res * 2);
            }, 4000);
        });
    })
    .then(
    (res) => { // 记做resolve3
        console.log(res, 'then2-----');
    });
```
所以以下代码的执行顺序是：

Promise0 - resolveTasklist: taskA=[resolve1]

Promise1 - resolve1 -> resolve()，resolveTasklist: taskB=[resolve2]

Promise2 - resolve2 -> resolve()，resolveTasklistC: taskC=[resolve3]

`new MyPromise()：Promise0 -> setTimeout1 -> 执行.then -> 创建taskA，返回Promise1(pending) -> 继续执行.then -> 创建taskB，返回Promise2(pending) -> 继续执行.then -> 创建taskC，返回Promise3(pending) ->>>>>>>> setTimeout1执行完毕 -> Promise0-fulfilled，执行taskA，调用resolve1，并传入Promise0的值(1) -> resolveCallback1返回2，同时Promise1内部执行resolve(2)，Promise1从pending-》fulfilled，执行taskB，调用resolve2，并传入Promise1的值(2) -> 这里要注意的是，因为resolve2执行后返回一个MyPromise实例，那么直接执行该MyPromise实例.then并接收resolve3，此时resolveTasklistC将不会执行，可以优化做下回收处理。`

```
Promise2 - 执行resolve2 --> 返回promiseNew.then(resolve3)
```


手写MyPromise的所有代码如下，可供参考和验证：

```js
class MyPromise {
    constructor(handler) {
        this._value = undefined;
        this.status = 'pendding';
        // resolveTaskList： fulfilled任务队列
        this.resolveTaskList = [];
        // rejectTaskList: rejected任务队列
        this.rejectTaskList = [];
        // 通过绑定this，确保resolve,reject的参数一定指向当前Promise的_value
        const resolveHandle = this.resolve.bind(this);
        const rejectHandle = this.reject.bind(this);
        handler(resolveHandle, rejectHandle);
    }
    resolve(val) {
        this._value = val;
        this.status = 'fulfilled';
        while (this.resolveTaskList.length) {
            const curTask = this.resolveTaskList.pop();
            curTask(this._value);
        }
    }
    reject(val) {
        this._value = val;
        this.status = 'rejected';
        while (this.rejectTaskList.length) {
            const curTask = this.rejectTaskList.pop();
            curTask(this._value);
        }
    }
    then(onFulfilled, onReject) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (x) => x;
        onReject =
            typeof onReject === 'function'
                ? onReject
                : (x) => {
                      throw newError(x);
                  };
        const { status, _value } = this;
        return new MyPromise((resolveNext, rejectNext) => {
            // penddingHandle: 异步处理pending状态下的MyPromise调用, 将回调存入任务队列，当前MyPromise被resolve或者reject时处理任务队列
            function penddingHandle() {
                this.resolveTaskList.push(resolveHandle);
                this.rejectTaskList.push(rejectHandle);
            }
            // _value用来接受当pending状态的MyPromise状态变更后的结果值，这里通过闭包保存了onFulfilled以及resolveNext的执行上下文，rejecteHandle函数同理
            function resolveHandle(_value) {
                const nextValue = onFulfilled(_value);
                if (nextValue instanceof MyPromise) {
                    nextValue.then(resolveNext, rejectNext);
                } else {
                    resolveNext(nextValue);
                }
            }
            function rejectHandle(_value) {
                const nextValue = onReject(_value);
                if (nextValue instanceof MyPromise) {
                    nextValue.then(resolveNext, rejectNext);
                } else {
                    rejectNext(nextValue);
                }
            }
            switch (status) {
                case 'pendding':
                    // 处理下this调用指向当前MyPromise
                    penddingHandle.call(this);
                    break;
                case 'fulfilled':
                    resolveHandle(_value);
                    break;
                case 'rejected':
                    rejectHandle(_value);
                    break;
                default:
                    break;
            }
        });
    }
}
```
到这里，.then的链式调用逻辑也完成的差不多了，至于其他API，就不一一实(摆)现(烂)了。



