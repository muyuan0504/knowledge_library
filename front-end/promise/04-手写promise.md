---
theme: nico
---
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
```
new Promise( (resolve, reject) => {} )
```
1. 接收一个函数类型的参数，该函数接收两个类型为函数的参数；
2. Promise(P)当前状态通过绑定resolve和reject回调执行，参数为P的结果值；

实现如下：

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
##### `.then(onFulfilled, onRejected?)`：
1. 接收两个参数，onFulfilled接收fulfilled状态的promsie值作为参数，onRejected接收rejected状态的promise值作为参数；
2. 如果非函数类型，onFulfilled会在内部被替换为 (x) => x，onRejected会在内部被替换为一个 "Thrower" 函数
3. 返回一个pending状态的promise(P), P的状态和值由.then的回调函数的返回值决定；


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

new MyPromise((resolve, reject) => {
    resolve(1);
})
    .then((res) => {
        console.log(res, 'then0-----');
        return res * 2;
    })
    .then((res) => {
        console.log(res, 'then1-----');
        return new MyPromise((resolve, reject) => {
            reject(res * 2);
        });
    })
    .then(
        (res) => {
            console.log(res, 'then2-----');
        },
        (err) => {
            console.log(err, 'then2-----err');
        }
    );
```
`.then异步`：

目前我们的MyPromise已经可以正常通过.then往后传递参数，如果new Promise()内执行了异步逻辑，.then能拿到正确的值吗？显然是不能的，目前.then函数内部我们还有pending状态的还未处理

扩展之后代码如下

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

new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(1);
    }, 1000);
})
    .then((res) => {
        console.log(res, 'then0-----');
        return res * 2;
    })
    .then((res) => {
        console.log(res, 'then1-----');
        return new MyPromise((resolve, reject) => {
            setTimeout(() => {
                resolve(res * 2);
            }, 4000);
        });
    })
    .then((res) => {
        console.log(res, 'then2-----');
    });
```
到这里，.then的链式调用逻辑也完成的差不多了，至于其他API，就不一一实(摆)现(烂)了。



