new Promise((resolve, reject) => {
    resolve();
})
    .then(3)
    .then((res) => {
        console.log(res, '有吗');
    });

Promise.resolve();
// Promise.reject();

class MyPromise {
    constructor(handler) {
        this._value = undefined;
        this.status = 'pendding';
        // 两个回调函数绑定this调用为当前MyPromise实例，如果不绑定，则是window调用，this为undefined
        const onFulfilled = this.resolve.bind(this);
        const onRejected = this.reject.bind(this);
        handler(onFulfilled, onRejected);
    }
    resolve(val) {
        if (this.status !== 'pendding') return;
        this._value = val;
        this.status = 'fulfilled';
    }
    reject(val) {
        if (this.status !== 'pendding') return;
        this._value = val;
        this.status = 'rejected';
    }
    then(onFulfilled, onRejected) {
        let nextValue = undefined;
        if (this.status === 'fulfilled' && typeof onFulfilled !== 'function') {
            nextValue = onFulfilled(this._value);
        } else {
            if (typeof onFulfilled === 'function') {
                nextValue = onRejected(this._value);
            }
        }
        const handlerCallback = function () {};
        return new MyPromise(handlerCallback);
    }
}

const myPormise = new MyPromise((resolve, reject) => {
    // resolve(0);
    reject(1);
}).then(
    (res) => {
        console.log(res, '----fulfilled----');
    },
    (err) => {
        console.log(err, '----rejected----');
    }
).then(res => {
    console.log(res);
});
// .then((res) => {});
console.log(myPormise);
