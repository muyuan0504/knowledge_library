---
theme: channing-cyan
---
## .all, .any, .race, .allSettled
这期讲一讲组合式Promise的调用api
### .all

```
Promise.all(iterable);
```
.all方法接收一个可迭代数组，并且返回一个Promise(P)，当数组内的所有promise状态都为fulfilled，或数组内没有pending状态的promise的时候，执行返回的Promise的onfulfilled函数，该接收由数组内的promise的值或者直接保存的非promise值的集合，要注意的是，**当数组内任意存在有一个promise被reject，那么返回的P直接返回rejected状态。**

```js
/** Promise.all */
const promiseA = Promise.resolve(11);
const promiseB = new Promise((resolve, reject) => {
    setTimeout(() => {
        // resolve(12)
        reject(12)
    }, 2000)
});
const promiseC = 13; // 如果参数中包含非 promise 值，这些值将被忽略，但仍然会被放在返回数组中（如果 promise 完成的话）
Promise.all([promiseA, promiseB, promiseC]).then(res => {
    console.log(res, '------promise.all------'); // 如果promiseB是resolve处理，2s后返回 [11, 12, 13]
}).catch(err => {
    console.log(err, '------promise.all-reject------'); // 如果promiseB是reject处理，2s 后打印12
})
```
- promise.all的异步和同步 <br>
1. 如果参数不包含任何Promise,比如number:13，那么返回一个异步resolved的promise <br> （
   *Google Chrome 58 在这种情况下返回一个已完成（already resolved）状态的 Promise）*
3. **如果Promise.all(iterable)的iterable为空数组，那么此时promise.all是同步执行,返回一个resolved的Promise对象**

```js
const promiseEmpty = Promise.all([]); // 将会直接resolve同步执行
const promiseConstant = Promise.all([1337, "hi"]); // 虽然没有promise，但是还是会被异步resolve
console.log(promiseEmpty, 'promiseEmpty'); // 打印： Promise {<fulfilled>: Array(0)} 'promiseEmpty'
console.log(promiseConstant, 'promiseConstant') // 打印： Promise {<pending>} 'promiseConstant'
setTimeout(function(){
    console.log('the stack is now empty');
    console.log(promiseConstant); // Promise {<fulfilled>: Array(2)}
});
```
### .any
.all方法接收一个可迭代数组，并且返回一个Promise(P)，一旦可迭代数组内的任意一个 promise 变成了fulfilled状态，那么P就会变成fulfilled状态，并且它的值就是可迭代数组内的首先fulfilled的 promise 的值，如果迭代数组内的所有promise都rejected，那么P的状态就是rejected，P的值的话是一个 [`AggregateError`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AggregateError) 实例，这是 [`Error`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Error) 的子类，用于把单一的错误集合在一起。

- 返回值：
1. 如果可迭代数组为空，返回一个rejected的promise；(Promise.all返回的是resolved的promise)
2. 如果参数不包含任何Promise,比如number:13，那么返回一个异步resolved的promise;
3. 一旦迭代数组内某个promise被resolve，那么返回的promise直接变为resolve状态，值为首个resolved的promise的值，如果所有的promise都被rejected了，那么返回的promise的值变为rejected状态，抛出错误 - `AggregateError: All promises were rejected`。

```js
/** Promise.any */
(function() {
    const promiseA = Promise.resolve(14);
    const promiseB = 15;
    const promiseC = Promise.reject(16);
    const promiseD = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(17);
        }, 3000);
    })
    Promise.any([promiseA, promiseB, promiseC]).then(res => {
        console.log(res, '------promise.any------'); // 14 【如果promiseB放前面，那么打印15】
    })

    Promise.any([promiseC, promiseD]).then(res => {
        console.log(res, '------promise.any------');
    }).catch(err => {
        console.log(err, '------promise.any reject------'); // AggregateError: All promises were rejected
    })

    Promise.any([]).then(res => {
        console.log(res, '------promise.any------');
    }).catch(err => {
        // 空数组直接进入rejected状态
        console.log(err, '------Promise.any-rejected,[]------'); // AggregateError: All promises were rejected
    })
})()
```
### .race
race: 竞争，赛跑; <br>
顾名思义，Promise.race()返回一个pending状态的promise(P)，迭代数组内第一个被resovled或rejected的promise的值，P的状态跟值跟该promise同步。<br>

- 返回值：
1.   如果迭代数组为[]，那么该promise一直是pending状态；
2.   迭代数组内的Promise一旦有被完成的，就采用第一个promise的值作为P的值，再异步的同步变更P的状态

```js
/** Promise.race */
Promise.race([18]).then(res => {
    console.log(res); // 18
})

Promise.race([Promise.resolve(19), Promise.resolve(20)]).then(res => {
    console.log(res, '------promise.race resolved------'); // 19
})

Promise.race([Promise.reject(21), Promise.resolve(22)]).then(res => {
    console.log(res);
}).catch(err => {
    console.log(err, '------promise.race rejected------'); // 21
})
```

### .allSettled
当Promise.allSettled()迭代数组内的所有Promise都已被resolved或rejected，返回一个Promise实例, 同时包括所有promise状态和值的对象数组，对于每个结果对象，都有一个status字符key，用于保存每个Promise返回的状态，如果是fulfilled状态，那么对象上用value用于保存该promise的返回值，如果rejected状态，那么对象上用reason记录该rejected的返回值

```js
/** Promise.allSettled */
Promise.allSettled([23, Promise.reject(24), 25]).then(res => {
    // [{status: 'fulfilled', value: 23}, {status: 'rejected', reason: 24}, {status: 'fulfilled', value: 25}]
    console.log(res, '----Promise.allSettled----');
})

const promiseE = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(26)
    }, 6000)
});

Promise.allSettled([promiseE, 1]).then(res => {
    console.log(res);  // 6s后打印 // [{status: 'rejected', reason: 26}, {status: 'fulfilled', value: 1}]
})
```
