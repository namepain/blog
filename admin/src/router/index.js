import Vue from 'vue'
import Router from 'vue-router'

import { createList, createEdit } from 'common/js/createComponent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/admin/signin'
    },
    {
      path: '/admin/signin',
      name: 'signIn',
      component: () => import('../components/SignIn')
    },
    {
      path: '/admin',
      component: () => import('../components/Main'),
      children: [
        {
          path: '/',
          name: 'main',
          component: () => import('../components/Dashboard')
        }
      ]
    },
    {
      path: '/post',
      component: () => import('../components/Main'),
      children: [
        {
          path: 'list',
          name: 'postList',
          component: createList('post')
        },
        {
          path: 'create/:id?',
          name: 'postCreate',
          component: () => import('../components/post/post')
        }
      ]
    },
    {
      path: '/cate',
      component: () => import('../components/Main'),
      children: [
        {
          path: 'list',
          name: 'cateList',
          component: createList('cate')
        },
        {
          path: 'create/:id?',
          name: 'cateCreate',
          component: createEdit('cate')
        }
      ]
    },
    {
      path: '/tag',
      component: () => import('../components/Main'),
      children: [
        {
          path: 'list',
          name: 'tagList',
          component: createList('tag')
        },
        {
          path: 'create/:id?',
          name: 'tagCreate',
          component: createEdit('tag')
        }
      ]
    }
    // {
    //   path: '/',
    //   name: 'signIn',
    //   component: () => import('../components/SignIn')
    // },
    // {
    //   path: '/admin',
    //   name: 'admin',
    //   component: () => import('../components/Admin'),
    //   children: [
    //     {
    //       path: 'userEdit',
    //       component: () => import('../components/userEdit')
    //     },
    //     {
    //       path: 'post',
    //       component: () => import('../components/post/Post')
    //     },
    //     {
    //       path: 'cate',
    //       component: () => import('../components/cate/CateList')
    //     },
    //     {
    //       path: 'tag',
    //       component: () => import('../components/tag/TagList')
    //     },
    //     {
    //       path: 'system',
    //       component: () => import('../components/system/System')
    //     }
    //   ]
    // }
  ]
})
