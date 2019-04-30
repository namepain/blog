class VueRouter {
  constructor(options) {
    const { mode, routes } = options
    this.mode = mode
    this.routes = routes

    // 路由 --> 组件映射
    this.routesMap = routes.reduce((prev, curr) => {
      let key = curr.path
      let comp = curr.component
      prev[key] = comp
      return prev
    }, {})

    // history 对象 存储当前路由信息
    this.history = Vue.observable({ current: '/' })

    this.init()
  }

  init() {
    if (this.mode === 'hash') {
      !location.hash && (location.hash = '/');

      ['load', 'hashchange'].forEach((event) => {
        window.addEventListener(event, () => {
          this.history.current = location.hash.slice(1)
        })
      })
    } else {
      !location.pathname && (location.pathname = '/');
      ['load', 'popstate'].forEach(event => {
        window.addEventListener(event, () => {
          this.history.current = location.pathname
        })
      })
    }
  }
}

VueRouter.install = function install (Vue) {
  Vue.mixin({
    beforeCreate: function() {
      // 根组件，直接挂在 _router 上, 否则找到 跟组件的 router
      if (this.$options && this.$options.router) {
        this._rootRouter = this
        this._router = this.$options.router
      } else {
        this._rootRouter = this.$parent._rootRouter
      }

      Object.defineProperty(this, '$router', {                // 代理 $router 到根 router 上
        get() {
          return this._rootRouter._router
        }
      })
      Object.defineProperty(this, '$route', {
        get() {
          return {
            current: this._rootRouter._router.history.current      // 代理 $route 到根 router.history.current 上
          }
        }
      })
    }
  })

  Vue.component('router-link', {
    props: {
      to: String,
      tag: String
    },
    methods: {
      handleClick(e) {
        if (this.mode === 'history') {
          e.preventDefault()
          window.history.pushState({}, null, e.target.href)
          this.$router.history.current = location.pathname
        }
      }
    },
    render(h) {
      let mode = this._rootRouter._router.mode
      this.mode = mode
      return h(this.tag || 'a', {
        attrs: {
          href: mode === 'hash' ? `#${this.to}` : this.to
        },
        on: {
          click: this.handleClick
        }
      }, this.$slots.default)
    }
  })
  Vue.component('router-view', {
    render(h) {
      let current = this.$router.history.current
      let comp = this.$router.routesMap[current]
      return h(comp)
    }
  })
}

export default VueRouter