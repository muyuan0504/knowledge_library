/** history */

history.length // 返回当前加载的页面数量
history.scrollRestoration // 许 Web 应用程序在历史导航上显式地设置默认滚动恢复行为, auto || manual
history.state // 返回一个表示历史堆栈顶部的状态的任意（any）值(这是一种不必等待 popstate 事件而查看状态的方式)

history.back()
// 异步调用, 转到浏览器会话历史的上一页, 与用户点击浏览器左上角返回行为相同，等价于history.go(-1);
history.forward()
// 异步调用, 转到浏览器会话历史的下一页, 与用户点击浏览器左上角下一页行为相同, 等价于history.go(1), 如果没有下一页，调用返回undefined, 不会报错
history.go()
// 异步调用, 通过当前页面的相对位置从浏览器历史记录（会话记录）异步加载页面, 不传参或者参数为0会重新载入当前页面
// IE浏览器指定一个字符串，而不是整数，可以转到历史记录列表中的特定 URL
history.pushState(stateObj, newpageTitle, newpageURL)
// 接收三个参数：一个状态对象(可以是能被序列化的任何东西, 序列化后640k的大小限制-原因在于 Firefox 将状态对象保存在用户的磁盘上，以便在用户重启浏览器时使用； 超过该限制会抛出异常), 一个标题 (目前被忽略), 和 (可选的) 一个 URL
// eg: history.pushState({page: 'newPage'}, "page new", "new.html"), originURL=www.jimous.com/cool.html
//     浏览器的地址栏会显示为www.jimous.com/new.html, 但是不会加载new.html(但可能会在稍后某些情况下加载这个 URL，比如在用户重新打开浏览器时),甚至也不会检查new.html是否存在(新 URL 必须与当前 URL 同源，否则 pushState() 会抛出一个异常)。
// pushState() 绝对不会触发 hashchange 事件

history.replaceState()
// 接收参数同pushState方法,与pushState()类似, 只不过是修改当前的历史记录项而不是新建一个, 使用场景在于为了响应用户操作，你想要更新状态对象 state 或者当前历史记录的 URL，比如执行了pushState之后，通过replaceState变更URL。
