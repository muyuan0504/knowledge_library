---
theme: channing-cyan
---
### js数据结构

**基本类型**：String、Number、Boolean、Symbol、Undefined、null,Bigint(ES2020) <br />
**引用类型**：Object, Function, Array, Date, RegExp ...

### 1. typeof操作符
typeof 是一个操作符，其右侧跟一个一元表达式，并返回这个表达式的数据类型。返回的结果用该类型的字符串(全小写字母)形式表示

```js
        console.log(typeof '1'); // string
        console.log(typeof 1); // number
        console.log(typeof true); // boolean
        console.log(typeof Symbol()); // symbol
        console.log(typeof undefined); // undefined
        console.log(typeof null); // object
        console.log(typeof 5n); // bigint
        console.log(typeof {}); // object
        console.log(typeof new Function()); // function
        console.log(typeof new Date()); // object
        console.log(typeof new RegExp()); // object
        
```
可以看到，typeof操作符返回的均是该类型字符串的小写字母形式，对于基本类型的判断 (*除null外，null 有属于自己的数据类型 Null*) 基本符合预期，但是对于引用类型的判断，只有Function符合预期，其余的只返回了其原型链最顶端的Object类型。

### 2. instanceof操作符
instanceof是为了判断某个对象是否是某个原型的实例，即A instanceof B, 如果返回true, 那么就表示A是B的实例对象, A.__proto__指向 B.prototype <br />

```js
        function a() {}
        console.log(new a() instanceof a); // true
        console.log(new Array(1,2,3) instanceof Array); // true
```
由于instanceof假定js是基于一个全局执行上下文，当页面包括多个iframe框架,此时对于数据类型的判断就会出现问题。

```js
        var iframe = document.createElement("iframe");
        document.body.appendChild(iframe);
        xArray = window.frames[0].Array;
        var arr = new xArray(1, 2, 3); // [1,2,3]
        console.log(arr instanceof Array, '测试', arr);; // false
        console.log(Array.isArray(arr), '打印看看'); // true
```
### 3. constructor引用
当一个变量被定义时，JS引擎就会为Ta添加prototype原型，然后在prototype上添加一个constructor属性，并指向该变量的引用。
```js
        console.log('1'.constructor === String); // true
        let a = 1;
        console.log(a.constructor === Number); // true
        console.log(true.constructor === Boolean); // true
        console.log(Symbol().constructor === Symbol); // true
        
        // console.log(undefined.constructor === undefined); // err报错
        // console.log(null.constructor === Null); // err报错
        // let b = 5n;
        // console.log(b.constructor === bigint); // err报错
        
        console.log({}.constructor === Object); // true
        let funA = () => 6
        console.log(funA.constructor === Function); // true
        let dateA = new Date()
        console.log(dateA.constructor === Date); // true
        let regA = /jimous/
        console.log(regA.constructor === RegExp); // true
```
对于undefined，null, bigint等不存在constructor属性的类型无法进行类型判断< br/>
并且由于prototype可以被重写，有可能导致对原有constructor的引用丢失，新的constructor默认为object,影响类型判断的准确性.

### 4. toString运算
toString是Object的原型方法，调用该方法，默认返回当前对象的[[class]],该方法会准确输出不同引用类型的数据类型。

```js
        console.log(Object.prototype.toString.call('1')); // [object String]
        console.log(Object.prototype.toString.call(1)); // [object Number]
        console.log(Object.prototype.toString.call(true)); // [object Boolean]
        console.log(Object.prototype.toString.call(Symbol())); // [object Symbol]
        console.log(Object.prototype.toString.call(undefined)); // [object Undefined]
        console.log(Object.prototype.toString.call(null)); // [object Null]
        console.log(Object.prototype.toString.call(5n)); // [object BigInt]
        console.log(Object.prototype.toString.call({})); // [object Object]
        console.log(Object.prototype.toString.call([])); // [object Array]
        console.log(Object.prototype.toString.call(new Function())); // [object Function]
        console.log(Object.prototype.toString.call(new Date())); // [object Date]
        console.log(Object.prototype.toString.call(/jimous/)); // [object RegExp]
```
