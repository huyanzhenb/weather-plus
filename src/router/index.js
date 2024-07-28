import {createRouter,createWebHashHistory} from 'vue-router'

const routes =[
    {
        path:'/',
        redirect:'/index'//重定向
    },
    {
        path:'/index',
        name:'index',
        component:()=>import('../views/index.vue')

        
    },


]
const router =createRouter({
    history:createWebHashHistory(),
    routes
})

export default router