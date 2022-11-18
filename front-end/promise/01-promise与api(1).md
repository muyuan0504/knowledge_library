---
theme: channing-cyan
---
## .then, .resolve, .reject, .catch, .finally
Promise相信大家都用的多，不过有些用法是处于习惯还是真的了解了promise的特性呢，比如下面这种写法，之前一直觉得resolve回调一定要return Promise.resolve(), 其实直接return value即可；<br>
一起重新回顾promise的特性，接下来我们来看看使用promise-api的正确调用方式吧。

```js
new Promise(resolve => {
    resolve(0)
}).then(res => {
    return res+1; // 等价与 return Promise.resolve(res)
}).then(res => {
    console.log(res); // 1
})
```
### Promise
> The **`Promise`** object represents the eventual completion (or failure) of an asynchronous operation and its resulting value.<br>
> <Promise对象表示异步操作的最终状态(完成或失败)及其结果值>

从定义上，我们知道promise是针对异步操作的，并且具有内部状态和结果值。
##### 状态
- *pending*: promise的初始状态
- *fulfilled*：操作(异步)成功执行
- *rejected*：操作(异步)执行失败
<br>
```js
/** Promise的三种状态 */
console.log(new Promise((resolve, reject) => {}));           // Promise {<pending>}
console.log(new Promise((resolve) => resolve(1)));           // Promise {<fulfilled>: 1}
console.log(new Promise((resolve, reject) => reject(1)));    // Promise {<rejected>: 1}, 同时还会throw内部reject出来的error

Promise的状态一旦进入fulfilled或者rejected，无法更改。
```
### .then
> The **`then()`**  method returns a [`Promise`]. It takes up to two arguments: callback functions for the fulfilled and rejected cases of the `Promise`
> <br>
> 
> Returns a new [`Promise`] immediately. This new promise is always pending when returned, regardless of the current promise's status

.then()方法会返回一个新的Promise(不管当前promise状态，返回的新的promise永远是pending初始状态)，同时接受两个函数类型参数来对应当前Promise的fulfilled和rejected两种状态，当接受一个参数时，默认为fulfilled状态对应函数。
```
.then(onFulfilled, onRejected) | .then(onFulfilled)
```
<br>
onFulfilled和onRejected函数均接受一个参数，分别对应上一个Promise对应状态的内部结果值。

> One of the `onFulfilled` and `onRejected` handlers will be executed to handle the current promise's fulfillment or rejection. The call always happens asynchronously, even when the current promise is already settled. The behavior of the returned promise (call it `p`) depends on the handler's execution result, following a specific set of rules. If the handler function:
> 1. returns a value: `p` gets fulfilled with the returned value as its value.
> 2. doesn't return anything: `p` gets fulfilled with `undefined`.
> 3. throws an error: `p` gets rejected with the thrown error as its value.
> 4. returns an already fulfilled promise: `p` gets fulfilled with that promise's value as its value.
> 5. returns an already rejected promise: `p` gets rejected with that promise's value as its value. <br>
> 
> returns another pending promise: the fulfillment/rejection of the promise returned by `then` will be subsequent to the resolution/rejection of the promise returned by the handler. Also, the resolved value of the promise returned by `then` will be the same as the resolved value of the promise returned by the handler.

当执行中的Promise由pending变为fulfilled或rejected状态，对应的onFulfilled和onRejected函数会被执行，这个执行通常是异步调用，即使当前的Promise以及状态改变了。同时.then返回的新的Promise(后面称作'p')的表现取决于onFulfilled或onRejected函数的执行结果，执行结果有以下参考规则：

- 当直接return value，p的状态切换为fulfilled并且该value就是p的值(参考最开始的例子)
- 不返回任何东西，p的状态切换为fulfilled并且值为undefined
- 抛出错误，p的状态切换为rejected,并且将抛出的错误当做p的值
- 返回Promise.resolve(value) || Promise.rejected(value)，p的状态切换为fulfilled并且将自己的值设为该Promise的值
- 返回一个pending状态的promise，p的状态取决于该promise的最终执行函数返回的结果。

```js
/** Promise.then()返回的新的Promise的值由当前.then的状态handler函数的返回值决定 */
new Promise((resolve) => {
    resolve(0);
})
    .then((res) => {
        console.log(res);            // 不返回，新的promise：fulfilled -> undefined
        // throw new Error('a');     // 直接抛出错误，新的promise：rejected -> 'a'
        // return 1;                 // 直接return value，新的promise：fulfilled -> 1
        // return Promise.resolve(2) // 新的promise：fulfilled -> 2
        // return Promise.reject(3)  // 新的promise：fulfilled -> 3
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(4); // 2s后，打印下一个.then的fulfilled处理函数打印4
            }, 2000)
        })
    })
    .then(
        (res) => {
            console.log(res, 'here check fulfilled-value');
        },
        (err) => {
            console.log(err, 'here check rejected-value'); // Error: a
        }
    );
```
### .resolve
> The **`Promise.resolve()`**  method "resolves" a given value to a [`Promise`]. If the value is a promise, that promise is returned; if the value is a [thenable], `Promise.resolve()` will call the `then()` method with two callbacks it prepared; otherwise the returned promise will be fulfilled with the value

Promise.resolve(value),如果value是一个promise, 那么直接返回这个promise，如果是一个thenable对象，那么会直接调用该对象的.then方法，如果只是一个正常的值，那么返回一个状态为fulfilled，值为该value的promise。

```js
/** promise.resolve */
Promise.resolve(5).then(res => {
    console.log(res); // 5
});

Promise.resolve(new Promise(resolve => {
    resolve(6)
})).then(res => {
    console.log(res); // 6
})

const myThenable = {};
myThenable.then = (() => {
    console.log(7);
});
Promise.resolve(myThenable); // 7
```

### .reject
> The **`Promise.reject()`**  method returns a `Promise` object that is rejected with a given reason.

Promise.reject(reason)，返回一个状态是rejected的promise对象，值为reason

```js
/** Promise.reject */
Promise.reject(new Error('8')).then(null, err => {
    console.log(err); // Error: 8
})
```
### .catch
> The **`catch()`**  method returns a [`Promise`] and deals with rejected cases only. It behaves the same as calling [`Promise.prototype.then(undefined, onRejected)`](in fact, calling `obj.catch(onRejected)` internally calls `obj.then(undefined, onRejected)`). This means that you have to provide an `onRejected` function even if you want to fall back to an `undefined` result value - for example `obj.catch(() => {})`.

````
p.catch(onRejected)
````
.catch()只能用来处理Promise被rejected状态的情况，同时返回一个新的Promise对象，新Promise对象的值由.catch注册的onRejected函数的返回值决定。

```js
/** Promise.catch */
new Promise((resolve, reject) => {
    reject(9)
}).catch(err => {
    console.log(err);  // 9
    return 10
}).then(res => {
    console.log(res);  // 10
})
```

### .finally
> The **`finally()`**  method of a [`Promise`] schedules a function, the *callback function*, to be called when the promise is settled. Like `then()` and `catch()`, it immediately returns an equivalent [`Promise`] object, allowing you to chain calls to another promise method, an operation called *composition*

.finally相当于Promise的进度函数，当Promise的状态变更确定之后最终执行该回调函数，可以避免将同样的代码写到onFulfilled和onRejected函数中。<br>
*.finally()的callback不会接收任何参数。*

