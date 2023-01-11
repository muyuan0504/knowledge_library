import Vue from 'vue';
import VueRouter from 'vue-router';
const IndexPage = () => import('index.vue');
Vue.use(VueRouter);

const routes = [
    { path: '/', redirect: '/index' },
    { path: '/index', name: 'index', component: IndexPage },
];
const router = new VueRouter({
    routes,
});

new Vue({
    render: (h) => h(App),
    router,
}).$mount('#app');


interface RouteConfig = {
    path: string,
    component?: Component,
    name?: string, // 命名路由
    components?: { [name: string]: Component }, // 命名视图组件
    redirect?: string | Location | Function,
    props?: boolean | Object | Function,
    alias?: string | Array<string>,
    children?: Array<RouteConfig>, // 嵌套路由
    beforeEnter?: (to: Route, from: Route, next: Function) => void,
    meta?: any,
  
    // 2.6.0+
    caseSensitive?: boolean, // 匹配规则是否大小写敏感？(默认值：false)
    pathToRegexpOptions?: Object // 编译正则的选项
  }

  function install() {
    Vue.mixin({
        beforeCreate () {
          if (isDef(this.$options.router)) {
            this._routerRoot = this
            this._router = this.$options.router
            this._router.init(this)
            Vue.util.defineReactive(this, '_route', this._router.history.current)
          } else {
            this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
          }
          registerInstance(this, this)
        },
        destroyed () {
          registerInstance(this)
        }
      })
  }

Vue.component('RouterView', View)
Vue.component('RouterLink', Link)


switch (mode) {
    case 'history':
      this.history = new HTML5History(this, options.base)
      break
    case 'hash':
      this.history = new HashHistory(this, options.base, this.fallback)
      break
    case 'abstract':
      this.history = new AbstractHistory(this, options.base)
      break
    default:
      if (process.env.NODE_ENV !== 'production') {
        assert(false, `invalid mode: ${mode}`)
      }
}




export const supportsPushState =
  inBrowser &&
  (function () {
    const ua = window.navigator.userAgent

    if (
      (ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) &&
      ua.indexOf('Mobile Safari') !== -1 &&
      ua.indexOf('Chrome') === -1 &&
      ua.indexOf('Windows Phone') === -1
    ) {
      return false
    }

    return window.history && typeof window.history.pushState === 'function'
  })()