---
theme: nico
---

## 标准文档流

标准文档流(即normal flow)，在标准模式下，元素按照其在HTML中的先后位置顺序自上而下布局排布。在这个过程中

1. 行内元素水平排列，直到当行被占满然后换行
2. 块级元素换到新的一行渲染展示(除非另外指定，比如行内块级)

`元素的位置由该元素在HTML文档中的位置决定`

表现如下：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5304a77ae9c4e82a21c7030c3007ed7~tplv-k3u1fbpfcp-watermark.image?)

```js
<div class="div1">这是一个块级盒子</div>
<div>
    <span>行内元素span标签</span>
    <br />
    <span>这个一个很长文本的行内元素这个一个很长文本的行内元素这个一个很长文本的行内元素这个一个很长文本的行内元素</span>
    <p>这个是块级元素p标签</p>
</div>
```

- 扩展

脱离标准文档流的方式有两种:

1. 浮动(浮动流)：在浮动布局中，元素首先按照普通流的位置出现，然后根据浮动的方向尽可能的向左边或右边偏移，其效果与印刷排版中的文本环绕相似
2. 定位(定位流)：在绝对定位布局中，元素会整体脱离普通流，因此绝对定位元素不会对其兄弟元素造成影响，而元素具体的位置由绝对定位的坐标决定

## BFC

- 概念与条件

`Block Formatting Contexts (块级格式化上下文)`

在BFC模式下，形成独立的渲染区域，并且有一套渲染规则，它决定了其子元素将如何定位，以及和其他元素的关系和相互作用

形成条件：

```js
对于块级元素：
浮动元素:  float不是none;
定位元素:  position 是 absolute 或 fixed;
块级元素:  overflow 不是 visible，而是(hidden、auto、scroll)等
body 根元素

对于非块级元素：
display属性为inline-block，table，flex,inline-block、inline-flex、flex、flow-root、table-caption、table-cell等
```

- 扩展应用

1. 解决外边距重叠

```js
<div>div1</div>
<div>div2</div>

div {
    width: 300px;
    height: 300px;
    background-color: yellowGreen;
    margin: 100px;
}
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cd2cd0dc2fba4392af246f203176612f~tplv-k3u1fbpfcp-watermark.image?)

可以看到div1和div2的margin是重叠的。

首先来看为什么会发生重叠，因为两个div元素都处于同一个BFC容器(body根元素)下；

那么，怎么解决边距重叠问题呢，这里可以引用BFC的特性，将两个div的渲染区域隔离成两个单独的BFC，因为BFC是一个相对独立的渲染空间，内部元素样式与外部元素隔离，所以外边距的渲染就是相对独立的。

代码如下：

```js
<div>
    <p>div1</p>
</div>
<div>
    <p>div2</p>
</div>

div {
    overflow: hidden;
}
p {
    width: 300px;
    height: 300px;
    background-color: yellowGreen;
    margin: 50px;
}
```

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/05312c031a144f78be9393db16499e52~tplv-k3u1fbpfcp-watermark.image?)

2. 清除浮动

假如有以下代码：

```js
<div class="float-item">浮动元素浮动元素浮动元素浮动元素浮动元素浮动元素浮动元素浮动元素</div>
<div class="normal-item">标准元素标准元素标准元素标准元素标准元素标准元素标准元素标准元素标准元素</div>

.float-item {
    width: 180px;
    float: left;
    background-color: yellowgreen;
}
.normal-item {
    width: 280px;
}
```
浏览器渲染如下：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/321652877242468697c3d4948d323edf~tplv-k3u1fbpfcp-watermark.image?)

可以看到`.normal-item`类div部分区域被float元素覆盖，如何避免这种影响？我们又可以利用BFC的特性了，只需要给normal-item元素加上overflow:hidden(当然你用其他形成BFC的样式，也可以实现同样的效果),那么就可以将渲染独立化，不受float元素影响了。

```js
.normal-item {
    width: 280px;
    overflow: hidden;
}
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d13667149104859ba4249a2e72a0c96~tplv-k3u1fbpfcp-watermark.image?)

## IFC

- 概念与条件

`Inline Formatting Contexts (内联格式化上下文)`

当多个内联元素排列在一起的时候就会形成一个IFC，这些内联元素之间不能穿插有块级元素，否则会被分割成多个IFC。IFC规定了内联元素的渲染规则，所有IFC内部都遵守共同的一套渲染机制。

- 扩展

1. 一个IFC内的元素都是水平排列的；
2. 横向的margin, border, padding属性对这些元素都是有效的；
3. float元素优先排列；
4. 垂直方向可以调整对齐方式

## 其他上下文格式

- GFC（GrideLayout formatting contexts）：网格布局格式化上下文

`当为一个元素设置 display 值为 grid 的时候，此元素将会获得一个独立的渲染区域`

- FFC（Flex formatting contexts）:自适应格式上下文

`display 值为 flex 或者 inline-flex 的元素会生成的自适应容器（flex container）`