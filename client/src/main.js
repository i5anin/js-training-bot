import { createApp } from 'vue'
import App from './App.vue'

import './style.css'


createApp(App)
    .use( {
        theme: {
            options: {
                darkModeSelector: '.dark',
            },
        },
    })
    .mount('#app')
