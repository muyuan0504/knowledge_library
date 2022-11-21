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
