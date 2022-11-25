/** history模式 */
console.log(location.hash);
document.getElementById('blue').classList.add('disappear-el');

console.log(document.getElementById('blue').classList.contains('disappear-el'));
document.getElementById('blue').classList.remove('disappear-el');
console.log(document.getElementById('blue').classList.contains('disappear-el'));

class RouterMap {
    // 初始化路由配置
    constructor(options) {
        const routes = options.router;
        this.initEventListen();
    }
    // // 初始化事件监听
    initEventListen() {
        window.addEventListener('popstate', (res) => {
            console.log(res.target.location.hash, 'hashchange==========');
        });
    }
    // 提供push跳转方法
    push(url) {}
}

const router = [
    {
        path: 'blue',
        name: 'pathBlue',
        components: '这里是blue路由~',
    },
    {
        path: 'orange',
        name: 'pathOrange',
        components: '这里是orange路由~',
    },
    {
        path: 'grey',
        name: 'pathGrey',
        components: '这里是grey路由~',
    },
];

const route = new RouterMap({
    router,
});

console.log(route);
