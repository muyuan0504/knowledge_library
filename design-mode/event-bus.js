/** 发布订阅 */

// const eventBus = {
//     eventList: {},
//     /** 订阅 */
//     $on(event, fn) {
//         if (!this.eventList[event]) {
//             this.eventList[event] = [];
//         }
//         this.eventList[event].push(fn);
//     },
//     /** 发布 */
//     $emit() {
//         // 利用数组shift取出发布事件的key
//         let key = Array.prototype.shift.call(arguments),
//             // fns, 找到订阅数组
//             fns = this.eventList[key];
//         if (!fns || fns.length === 0) {
//             return false;
//         }
//         for (let i = 0; i < fns.length; i++) {
//             let fn = fns[i];
//             fn.apply(this, arguments);
//         }
//     },
// };

class MessageEvent {
    constructor() {
        this.eventList = [];
    }
    $on(event, fn) {
        if (!this.eventList[event]) {
            this.eventList[event] = [];
        }
        this.eventList[event].push(fn);
    }
    $emit() {
        let key = Array.prototype.shift.call(arguments),
            fns = this.eventList[key];
        if (!fns || fns.length === 0) {
            return false;
        }
        for (let i = 0; i < fns.length; i++) {
            let fn = fns[i];
            fn.apply(this, arguments);
        }
    }
}

const eventBus = new MessageEvent();

eventBus.$on('saysay', (name) => {
    console.log(name);
});

eventBus.$on('saysay', (name) => {
    console.log(name, '2333');
});

eventBus.$emit('saysay', 'jimous');
