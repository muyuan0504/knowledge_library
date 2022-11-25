location.href;
// 完整链接, 'https://juejin.cn/creator/content/article/drafts#/iscool?isright=1'
location.protocol;
// 对应http协议，最后有一个":", 'https:'
location.host;
// 域名(可能在该串最后带有一个":"并跟上 URL 的端口号), 'juejin.cn'
location.hostname;
// 域名, 'juejin.cn'
location.port;
// 端口号
location.pathname;
// 链接中以'/'开头直到'#'前的这段路径, '/creator/content/article/drafts'
location.search;
// 链接中'?'后面的内容，注意'https://juejin.cn/creator/content/article/drafts#/iscool?isright=1' -> ''; 'https://juejin.cn/creator/content/article/drafts?isright=1' -> '?isright=1'
location.hash;
// 返回'#'后面的内容, '#/iscool?isright=1'
location.origin;
// 返回当前页面域名的标准形式


// 假定originUrl: 'https://juejin.cn/creator/content/article/drafts#/iscool?isright=1'

location.assign((path = ''));
// 加载给定 URL 的内容资源到当前location上(基于当前域名资源路径)，如果传空字符，会刷新页面
// location.assign('notcool') -> 'https://juejin.cn/creator/content/article/notcool'
location.reload(refresh?);
// 重新加载RUL，refresh为可选参数，true -> 类似于强制刷新； false -> 允许本地缓存刷新
location.replace(url);
// 用给定的url替换掉当前资源(基于当前域名资源路径)，与assign方法不同的是，replace替换的新页面不会保存在回话的History栈中，用户进入到新url无法通过后退按钮返回回去
// 满足下面这个规则：
// location.replace('notcool'|| './notcool'):    originUrl ->  'https://juejin.cn/creator/content/article/notcool'
// location.replace('/notcool'):                 originUrl ->  'https://juejin.cn/notcool'
// location.replace('www.baidu.com'):            originUrl ->  'https://juejin.cn/creator/content/article/www.baidu.com'
// location.replace('https://www.baidu.com'):    originUrl ->  'https://www.baidu.com'
location.toString();
// 返回整个URL，与href效果相同，但是用它无法修改location的值
