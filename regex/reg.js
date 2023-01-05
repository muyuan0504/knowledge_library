/** 学习正则的正确姿势 */

// const reg = new RegExp('\\d+.*', 'i');
// console.log(reg.constructor);
// console.log(reg.global); // false
// console.log(reg.ignoreCase); // true
// console.log(reg.lastIndex); // 0
// console.log(reg.multiline); // false
// console.log(reg.source); // \d+.*
// console.log(reg.test('hahah')); // false
// console.log(reg.test('12hhh')); // true
// console.log(reg.toString()); // /\d+.*/g

// const reg2 = /\d+.*/g;
// console.log(reg2.test('hahah')); // false
// console.log(reg2.test('12hahah')); // true
// console.log(reg2.toString()); // /\d+.*/g

// const jimousReg = /jimous/g;
// console.log(jimousReg.test('jimous is cool')); // true
// console.log(jimousReg.test('jimou')); // false

// const jimousReg2 = /jimous.*cool$/g;
// console.log(jimousReg2.test('jimous is cool'));      // true
// console.log(jimousReg2.test('jimous is cool ohhh')); // false

// const regTest = new RegExp('cool', 'g');
// const regText = 'jimous is cool, yes, very cool';

// console.log(regTest.exec(regText)); // [ 'cool', index: 10, input: 'jimous is cool, yes, very cool', groups: undefined ]
// console.log(regTest.exec(regText)); // [ 'cool', index: 26, input: 'jimous is cool, yes, very cool', groups: undefined ]

// console.log(regTest.test('jimous is cool')); // true
// console.log(regTest.test('jimous is happy')); // false

// console.log(regTest.toString()); // /cool/g

// regTest.compile('happy', 'g');
// console.log(regTest.toString());              // /happy/g
// console.log(regTest.test('jimous is happy')); // true

const regText = 'jimous is cool~';
// const regTest = /o/g;

// console.log(regText.search(regTest)); // 0
// console.log('hahah'.search(regTest)); // -1

// const regTest = /o/g;
// console.log(regText.match(regTest)); // ['o', 'o', 'o']
// console.log('hahah'.match(regTest)); // null

// const regTest = /cool/g;
// const newStr = regText.replace(regTest, 'happy');
// console.log(newStr); // jimous is happy~

const regTest = /cool/g;
console.log(regText.split('cool'));
console.log(regText.split(regTest)); // [ 'jimous is ', '~' ]
