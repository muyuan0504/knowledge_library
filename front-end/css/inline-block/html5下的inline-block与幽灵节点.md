---
theme: channing-cyan
---
最近将前端某块业务系统接入公司统一公共模板服务的项目过程中，遇到了一个很奇怪的问题，同一份代码，旧模板服务样式正常，新模板服务部分样式垮了，主要集中在display:inline-block的行内元素上。

![Snipaste_2022-11-15_18-02-51.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/981eab6e9cc34131a45db68c56b862cf~tplv-k3u1fbpfcp-watermark.image?)

带着疑问我们来看下是什么属性从中作梗，影响了原有的页面布局。

#### HTML5下的inline-block与幽灵空白节点
引一段HTML5规范：
> "Each line box starts with a zero-width inline box with the element's font and line height properties. We call that imaginary box a 'strut'." <br>
> 每个行框盒子都以一个零宽度，带有元素字体以及行高属性的内框开始，我们称这个假想的盒子为'支柱'

看这个h5页面：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e883e15500d14b9ea9fb654d43d8d2fe~tplv-k3u1fbpfcp-watermark.image?)
我们能看到几个现象：
1. .container盒子即使内联一个span，还能看到一段高度差
2. 第二个div，内嵌一个span空标签，但是依然有一个高度

是的，这就是幽灵空白节点在暗中发力；结合html5规范，图片中的元素实际就是

```js
<div>'strut'<span></span></div>
'strut'的存在，影响了div的高度和布局
```
完整代码如下，有兴趣不妨试试：
```js
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
        <style>
            :root {
                font-size: 50px;
            }
            div {
                background-color: rgb(26, 85, 153);
            }
            .container {
                background: rgba(0, 149, 182);
            }
            .container span {
                font-size: 0.48rem;
                background: rgba(143, 75, 40);
                color: #fff;
                padding: 0.16rem;
                border-radius: 0.32rem;
                box-sizing: border-box;
            }
            span {
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="container"><span>那些你很冒险的梦</span></div>
        <div><span></span></div>
    </body>
</html>

```
#### 如果处理幽灵空白节点的影响呢
###### display布局
将行内元素所在的父元素，display：flex;

###### font-size置为0
将空白幽灵节点看做是一个字符，那么它的告诉就是受font-size影响的，可以将行内元素所在的父元素font-size设置为0，不过注意font-size具有继承性，父元素内的其他元素的font-size需手动设置；

#### 所以，为啥同一份代码，两份模板样式表现不一致呢
回到刚刚讲过的，空白幽灵节点是html5规范的一部分，最后在我仔细看了模板html页面后，发现果然两份模板不一致，就模板是纯html(不存在空白幽灵节点)，新模板是html5，至此真相大白。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/056a94eb16f04e3dafb308a455a07abc~tplv-k3u1fbpfcp-watermark.image?)
