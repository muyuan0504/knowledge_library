const instanceInit = (function () {
    let instance;
    return function () {
        if (!instance) {
            instance = {
                name: 'instance',
                title: '我是一个单例',
            };
        }
        return instance;
    };
})();

// const instance1 = instanceInit();
// const instance2 = instanceInit();

// console.log(instance1 === instance2);

class InstanceMode {
    static Instance = null;
    static getInstance() {
        if (InstanceMode.Instance) {
            return InstanceMode.Instance;
        }
        InstanceMode.Instance = new InstanceMode();
        return InstanceMode.Instance;
    }
    constructor() {
        this.name = 'instance';
        this.title = '我是一个单例';
    }
}

const instance1 = InstanceMode.getInstance();
const instance2 = InstanceMode.getInstance();

console.log(instance1 === instance2, InstanceMode.nstance);

/** 惰性单例 */
function getSingle(fn) {
    let result;
    return function () {
        return result || (result = fn.apply(this, auguments));
    };
}

const createSingler = getSingle(createSingle); // createSingle创建对象
