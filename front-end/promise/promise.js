/** Promise的三种状态 */
console.log(new Promise((resolve, reject) => {})); // Promise {<pending>}
console.log(new Promise((resolve) => resolve(1))); // Promise {<fulfilled>: 1}
// console.log(new Promise((resolve, reject) => reject(1))); // Promise {<rejected>: 1}, 同时还会throw内部reject出来的error

/** Promise.then()返回的新的Promise的值由当前.then的状态handler函数的返回值决定 */
new Promise((resolve) => {
    resolve(0);
})
    .then((res) => {
        console.log(res); // 不返回，新的promise：fulfilled -> undefined
        // throw new Error('a');     // 直接抛出错误，新的promise：rejected -> 'a'
        // return 1;                 // 直接return value，新的promise：fulfilled -> 1
        // return Promise.resolve(2) // 新的promise：fulfilled -> 2
        // return Promise.reject(3)  // 新的promise：fulfilled -> 3
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(4); // 2s后，打印下一个.then的fulfilled处理函数打印4
            }, 2000);
        });
    })
    .then(
        (res) => {
            console.log(res, 'here check fulfilled-value');
        },
        (err) => {
            console.log(err, 'here check rejected-value'); // Error: a
        }
    );

/** promise.resolve */
Promise.resolve(5).then((res) => {
    console.log(res); // 5
});

Promise.resolve(
    new Promise((resolve) => {
        resolve(6);
    })
).then((res) => {
    console.log(res); // 6
});

const myThenable = {};
myThenable.then = () => {
    console.log(7);
};
Promise.resolve(myThenable); // 7

/** Promise.reject */
Promise.reject(new Error('8')).then(null, (err) => {
    console.log(err); // Error: 8
});

/** Promise.catch */
new Promise((resolve, reject) => {
    reject(9);
})
    .catch((err) => {
        console.log(err); // 9
        return 10;
    })
    .then((res) => {
        console.log(res); // 10
    });

/** Promise.all */
const promiseA = Promise.resolve(11);
const promiseB = new Promise((resolve, reject) => {
    setTimeout(() => {
        // resolve(12)
        reject(12);
    }, 2000);
});
const promiseC = 13; // 如果参数中包含非 promise 值，这些值将被忽略，但仍然会被放在返回数组中（如果 promise 完成的话）
Promise.all([promiseA, promiseB, promiseC])
    .then((res) => {
        console.log(res, '------promise.all------'); // 如果promiseB是resolve处理，2s后返回 [11, 12, 13]
    })
    .catch((err) => {
        console.log(err, '------promise.all-reject------'); // 如果promiseB是reject处理，2s 后打印12
    });

const promiseEmpty = Promise.all([]); // 将会直接resolve同步执行
const promiseConstant = Promise.all([1337, 'hi']); // 虽然没有promise，但是还是会被异步resolve
console.log(promiseEmpty, 'promiseEmpty'); // 打印： Promise {<fulfilled>: Array(0)} 'promiseEmpty'
console.log(promiseConstant, 'promiseConstant'); // 打印： Promise {<pending>} 'promiseConstant'
setTimeout(function () {
    console.log('the stack is now empty');
    console.log(promiseConstant); // Promise {<fulfilled>: Array(2)}
});

/** Promise.any */
(function () {
    const promiseA = Promise.resolve(14);
    const promiseB = 15;
    const promiseC = Promise.reject(16);
    const promiseD = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(17);
        }, 3000);
    });
    Promise.any([promiseA, promiseB, promiseC]).then((res) => {
        console.log(res, '------promise.any------'); // 14 【如果promiseB放前面，那么打印15】
    });

    Promise.any([promiseC, promiseD])
        .then((res) => {
            console.log(res, '------promise.any------');
        })
        .catch((err) => {
            console.log(err, '------promise.any reject------'); // AggregateError: All promises were rejected
        });

    Promise.any([])
        .then((res) => {
            console.log(res, '------promise.any------');
        })
        .catch((err) => {
            console.log(err, '------Promise.any-rejected,[]------'); // AggregateError: All promises were rejected
        });
})();

/** Promise.race */
Promise.race([18]).then((res) => {
    console.log(res); // 18
});

Promise.race([Promise.resolve(19), Promise.resolve(20)]).then((res) => {
    console.log(res, '------promise.race resolved------'); // 19
});

Promise.race([Promise.reject(21), Promise.resolve(22)])
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err, '------promise.race rejected------'); // 21
    });

/** Promise.allSettled */
Promise.allSettled([23, Promise.reject(24), 25]).then((res) => {
    // [{status: 'fulfilled', value: 23}, {status: 'rejected', reason: 24}, {status: 'fulfilled', value: 25}]
    console.log(res, '----Promise.allSettled----');
});

const promiseE = new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(26);
    }, 6000);
});

Promise.allSettled([promiseE, 1]).then((res) => {
    console.log(res); // 6s后打印 // [{status: 'rejected', reason: 26}, {status: 'fulfilled', value: 1}]
});


