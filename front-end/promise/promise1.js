// class MyPromise {
//     constructor() {}
//     then() {}
//     catch() {}
//     finally() {}
//     static resolve() {}
//     static reject() {}
//     static all() {}
//     static any() {}
//     static allSettled() {}
//     static race() {}
// }

class MyPromise {
    constructor(handler) {
        this._value = undefined;
        this.status = 'pendding';
        const resolve = (val) => {
            this._value = val;
            this.status = 'fulfilled';
        };
        const reject = (val) => {
            this._value = val;
            this.status = 'rejected';
        };
        handler(resolve, reject);
    }
    // 接收两个函数类型参数
    then(onFulfilled, onRejected) {
        // if(typeof onFulfilled !== 'function')
        // if(typeof onRejected !== 'function')
        const { status, _value } = this;
        return new Promise((resolveNext, rejectNext) => {
            const resolveCallback = () => {
                // 返回的promise的状态和值由当前promise的状态和值决定
                const value = onFulfilled(_value);
                resolveNext(value);
            };
            const rejectCallback = () => {
                const value = onRejected(_value);
                rejectNext(value);
            };
            switch (status) {
                case 'fulfilled':
                    resolveCallback();
                    break;
                case 'rejected':
                    rejectCallback();
                    break;
                default:
                    break;
            }
        });
    }
}

const promiseOrigin = new Promise((resolve, reject) => {
    resolve(1);
})
    .then((res) => {
        console.log(res, 'promiseOrigin----.then0'); // 1
        return res + 1;
    })
    .then((res) => {
        console.log(res, 'promiseOrigin----.then1');
    });

const promiseMine = new MyPromise((resolve, reject) => {
    resolve(1);
})
    .then((res) => {
        console.log(res, 'minePromise----.then0'); // 1
        return res + 1;
    })
    .then((res) => {
        console.log(res, 'minePromise----.then1');
    });

console.log(promiseOrigin, promiseMine);
