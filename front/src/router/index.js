import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const HOME = () => import('../views/HomeView.vue')

export function createRouter () {
  return new Router({
    mode: 'history',
    fallback: false,
    routes: [
      { path: '/', component: HOME },
      { path: '/archives', component: () => import('../views/ArchiveView.vue') },
      { path: '/tags', component: () => import('../views/TagView.vue') },
      { path: '/about', component: () => import('../views/AboutView.vue') },
      // { path: '/search', component: () => import('../views/SearchView.vue') },
      { path: '/post/:pathName', name: 'post', component: () => import('../views/Post.vue') },
      { path: '/tag/:tagName', name: 'tag', component: () => import('../views/tagPager.vue') },
      { path: '/:page*', component: HOME }
    ]
  })
}
