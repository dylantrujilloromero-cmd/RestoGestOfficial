import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../views/AdminLayout.vue'
import ReservarView from '../views/ReservarView.vue'
import FormularioReserva from '../views/FormularioReserva.vue'

const routes = [
  {
    path: '/',
    name: 'admin',
    component: AdminLayout
  },
  {
    path: '/reservar',
    name: 'reservar',
    component: ReservarView
  },
  {
    path: '/formulario-reserva',
    name: 'formulario-reserva',
    component: FormularioReserva
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
