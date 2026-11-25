import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import DataService from './services/DataService.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/css/main.css'

// Los restaurantes se leen de forma síncrona en varias vistas: se cargan antes de montar la app
try {
  await DataService.init()
} catch (e) {
  console.error('No se pudieron cargar los restaurantes:', e.message)
}

const app = createApp(App)
app.use(router)
app.mount('#app')
