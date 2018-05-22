import Vue from 'vue'
import Router from 'vue-router'

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
          redirect: '/post/list'
          // component: () => import('../components/Dashboard')
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
          component: () => import('../components/post/PostList')
        },
        {
          path: 'create/:id?',
          name: 'postCreate',
          component: () => import('../components/post/PostView')
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
          component: () => import('../components/cate/CateList')
        },
        {
          path: 'create/:id?',
          name: 'cateCreate',
          component: () => import('../components/cate/CateEdit')
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
          component: () => import('../components/tag/TagList')
        },
        {
          path: 'create/:id?',
          name: 'tagCreate',
          component: () => import('../components/tag/TagEdit')
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
