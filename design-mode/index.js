const listA = [1, 2, 3];
const ObjA = {
    a: 1,
    b: 2,
};

// for (key in ObjA) {
//     console.log('====================================');
//     console.log(key, listA);
//     console.log('====================================');
// }

// for (const key of listA) {
//     console.log('====================================');
//     console.log(key, listA);
//     console.log('====================================');
// }

function each(array, callback) {
    for (let i = 0; i < array.length; i++) {
        if (callback(array[i]) === false) {
            break;
        }
    }
}

// each([1, 2, 3], (num) => {
//     if (num > 1) {
//         return false;
//     }
//     console.log(num);
// });

function outIterator(obj) {
    const length = obj.length;
    let curIdx = 0;
    const next = () => {
        curIdx += 1;
    };
    const isDone = () => {
        return curIdx >= obj.length - 1;
    };
    const getCurentItem = () => {
        return obj[curIdx];
    };
    return {
        next,
        isDone,
        getCurentItem,
        length,
    };
}

let list = [1, 2, 3];

const outCtx = outIterator(list);

console.log(outCtx.getCurentItem()); // 1
outCtx.next();
outCtx.next();
console.log(outCtx.getCurentItem()); // 3
console.log(outCtx.isDone());        // true
