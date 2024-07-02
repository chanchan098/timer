import { createMemoryHistory, createRouter } from 'vue-router'

import Timer from "../views/Timer.vue"

const routes = [
    { path: '/', redirect: "/timer" },
    {
        path: '/timer',
        component: Timer
    },
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})


export default router