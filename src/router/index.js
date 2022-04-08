import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/pages/Index.vue'
import Share from '@/pages/Share.vue'
import Editor from '@/pages/Editor.vue'
import Source from '@/pages/Source.vue'
import DataDebug from '@/pages/DataDebug.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index
    },
    {
      path: '/share/:hash?',
      name: 'Share',
      component: Share
    },
    {
      path: '/editor',
      name: 'Editor',
      component: Editor
    },
    {
      path: '/source',
      name: 'Source',
      component: Source
    },
    {
      path: '/datadebug',
      name: 'DataDebug',
      component: DataDebug
    }
  ],
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  mode: 'history'
})
