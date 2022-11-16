---
theme: smartblue
---
js运行过程中，如何知道一个变量是否被回收了，可以直接利用WeakMap和WeakRef这两个API，下面让我们来看看这两个API。

#### WeakMap

WeakMap对所存储的[键值对]属于弱引用，并不会影响js的自动垃圾回收，如果所存储的key已被回收，那么WeakMap对象获取该Key返回false

```js
WeakMap的存储结构是以键值对的形式，key一定得是Object类型(null除外)，值则为any。
WeakMap提供delete(key),has(key),get(key),set(key, val)四种方法

const weakCtx = new WeakMap();
let a = { key: 'a' };
weakCtx.set(a, 1);
console.log(weakCtx.has(a)); // true
a = null; // 触发回收
console.log(weakCtx.get(a), weakCtx.has(a)); // undefined, false
```

#### WeakRef

WeakRef同样用于创建对象的弱引用，实例方法deref返回当前实例的 WeakRef 对象所绑定的 target 对象，如果该 target 对象已被 GC 回收则返回`undefined`


```js
let a = { key: 'a' };
const keyRef = new WeakRef(a);
setInterval(() => {
    const newA = keyRef.deref();
    if (newA) {
        console.log('存在 newA');
    } else {
        console.log('key: ', keyRef.deref()); // 执行一段时间后，打印undefined
    }
}, 1000);
setTimeout(() => {
    console.log('reset a');
    a = null;
}, 2000);
```
> 正确使用 WeakRef 对象需要仔细的考虑，最好尽量避免使用。避免依赖于规范没有保证的任何特定行为也是十分重要的。何时、如何以及是否发生垃圾回收取决于任何给定 JavaScript 引擎的实现。**GC 在一个 JavaScript 引擎中的行为有可能在另一个 JavaScript 引擎中的行为大相径庭，或者甚至在同一类引擎，不同版本中 GC 的行为都有可能有较大的差距**。GC 目前还是 JavaScript 引擎实现者不断改进和改进解决方案的一个难题<br>
引自https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakRef
