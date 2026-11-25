<template>
  <!-- PANTALLA DE LOGIN -->
  <div v-if="!isLoggedIn" class="login-screen">
    <div class="login-card">
      <div class="login-logo">
        <h1 class="login-title">RestoGest</h1>
        <p class="login-subtitle">Sistema de Reservas Multirestaurante</p>
      </div>
      <div class="login-restaurants">
        <span v-for="r in restaurantesLogin" :key="r.id">{{ r.nombre }}</span>
      </div>

      <!-- Login Form -->
      <div v-if="!showRecoverPassword" class="login-form">
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" class="form-control" placeholder="correo@ejemplo.com" v-model="loginForm.email" @keyup.enter="doLogin">
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" class="form-control" placeholder="••••••••" v-model="loginForm.password" @keyup.enter="doLogin">
        </div>
        <div v-if="loginForm.error" class="login-error">{{ loginForm.error }}</div>
        <button class="btn btn-primary login-btn" @click="doLogin" :disabled="loginLoading">
          <span v-if="loginLoading"><span class="spinner-border spinner-border-sm me-2"></span>Verificando...</span>
          <span v-else>Iniciar sesión</span>
        </button>
        <p class="text-center mt-3 mb-0">
          <a href="#" class="small" @click.prevent="showRecoverPassword = true">¿Olvidaste tu contraseña?</a>
        </p>
      </div>

      <!-- Recover Password -->
      <div v-if="showRecoverPassword" class="login-form">
        <h3 class="text-center mb-2">Recuperar contraseña</h3>
        <p class="text-center small text-secondary mb-4">Ingresa tu correo electrónico y te enviaremos las instrucciones para recuperar tu contraseña.</p>
        <div class="form-group">
          <label>Correo Electrónico</label>
          <input type="email" class="form-control" placeholder="correo@ejemplo.com" v-model="recoverForm.email" @keyup.enter="doRecoverPassword">
        </div>
        <div v-if="recoverForm.error" class="login-error">{{ recoverForm.error }}</div>
        <div v-if="recoverForm.message" class="alert border-0 py-2 small fw-bold" style="background: var(--mint); color: var(--mint-ink);">{{ recoverForm.message }}</div>
        <button class="btn btn-primary login-btn" @click="doRecoverPassword">Enviar Instrucciones</button>
        <button class="btn btn-secondary login-btn" style="margin-top:8px;" @click="cancelRecover">Volver al Inicio de Sesión</button>
      </div>

      <p class="login-hint">Contacta al jefe para obtener tus credenciales de acceso.</p>
    </div>
  </div>

  <!-- APLICACIÓN PRINCIPAL -->
  <template v-if="isLoggedIn">
    <SidebarComponent
      :currentUser="currentUser"
      :isJefe="isJefe"
      :restaurantes="restaurantes"
      :selectedRestaurantId="selectedRestaurantId"
      :currentRestaurant="currentRestaurant"
      :activeTab="activeTab"
      @update:activeTab="activeTab = $event"
      @update:selectedRestaurantId="selectedRestaurantId = $event"
      @logout="doLogout"
    />

    <main class="main-wrapper" :class="restaurantThemeClass">
      <TopbarComponent
        :currentRestaurant="currentRestaurant"
        :currentRestaurantLogo="currentRestaurantLogo"
        :currentRestaurantCarta="currentRestaurantCarta"
        :isJefe="isJefe"
        @addReserva="openCreateModal()"
        @logoUpload="onLogoUpload"
      />

      <div class="content-body">
        <MetricsComponent
          :metricTotalHoy="metricTotalHoy"
          :metricConfirmadasHoy="metricConfirmadasHoy"
          :metricComensalesHoy="metricComensalesHoy"
          :currentRestaurant="currentRestaurant"
        />

        <!-- PESTAÑA CALENDARIO -->
        <CalendarioTab
          v-if="activeTab === 'calendario'"
          :monthYearTitle="monthYearTitle"
          :calendarGridCells="calendarGridCells"
          :selectedDateStr="selectedDateStr"
          :dayReservations="dayReservations"
          :currentRestaurant="currentRestaurant"
          @prevMonth="prevMonth"
          @nextMonth="nextMonth"
          @goToToday="goToToday"
          @selectDate="selectDate"
          @openCreateModal="openCreateModal"
          @openEditModal="openEditModal"
          @cancelReservation="cancelReservation"
        />

        <!-- PESTAÑA LISTA RESERVAS -->
        <ListaReservasTab
          v-if="activeTab === 'reservas_lista'"
          :filteredReservas="filteredReservas"
          @openCreateModal="openCreateModal()"
          @openEditModal="openEditModal"
          @cancelReservation="cancelReservation"
        />

        <!-- PESTAÑA NOVEDADES -->
        <NovedadesTab
          v-if="activeTab === 'novedades'"
          :currentRestaurant="currentRestaurant"
          :filteredNovedades="filteredNovedades"
          :busquedaNovedad="busquedaNovedad"
          :filtroNovedad="filtroNovedad"
          @update:busquedaNovedad="busquedaNovedad = $event"
          @update:filtroNovedad="filtroNovedad = $event"
          @openNovedadForm="openNovedadForm"
          @verNovedad="verNovedad"
        />

        <!-- PESTAÑA BRIEFING -->
        <BriefingTab
          v-if="activeTab === 'briefing'"
          :currentRestaurant="currentRestaurant"
          :filteredBriefings="filteredBriefings"
          @openBriefingForm="openBriefingForm"
          @verBriefing="verBriefing"
        />

        <!-- PESTAÑA AJUSTES JEFE -->
        <AjustesJefeTab
          v-if="activeTab === 'ajustes_jefe' && isJefe"
          :restaurantes="restaurantes"
          :adminUsuarios="adminUsuarios"
          :editRestaurantForm="editRestaurantForm"
          :showAddUserForm="showAddUserForm"
          :newUserForm="newUserForm"
          :adminMessages="adminMessages"
          :restaurantLogos="restaurantLogos"
          :restaurantCartas="restaurantCartas"
          @startEditRestaurant="startEditRestaurant"
          @saveRestaurantChanges="saveRestaurantChanges"
          @cancelEditRestaurant="editRestaurantForm.id = ''"
          @openAddUserForm="openAddUserForm"
          @cancelAddUser="cancelAddUser"
          @saveNewUser="saveNewUser"
          @deleteUser="deleteUser"
          @getRestaurantLogo="getRestaurantLogo"
          @onRestaurantLogoUpload="onRestaurantLogoUpload"
          @removeRestaurantLogo="removeRestaurantLogo"
          @getRestaurantCarta="getRestaurantCarta"
          @onCartaUpload="onCartaUpload"
          @removeRestaurantCarta="removeRestaurantCarta"
          @getAdminMsg="getAdminMsg"
          @setAdminMsg="setAdminMsg"
          @saveAdminMsg="saveAdminMsg"
        />
      </div>
    </main>

    <!-- MODALES -->
    <ModalReserva
      v-if="showCreateModal"
      title="Añadir nueva reserva"
      :currentRestaurant="currentRestaurant"
      :formReserva="formReserva"
      :ocasionesDisponibles="ocasionesArr"
      :planesSelector="planesSelectorArr"
      @close="showCreateModal = false"
      @save="saveNewReservation"
      @filterPhone="filterPhoneInput"
      @planChanged="onPlanChanged"
    />
    <ModalReserva
      v-if="showEditModal"
      :title="'Editar Reserva — ' + formReserva.nombre_cliente"
      :currentRestaurant="currentRestaurant"
      :formReserva="formReserva"
      :ocasionesDisponibles="ocasionesArr"
      :planesSelector="planesSelectorArr"
      :isEdit="true"
      @close="showEditModal = false"
      @save="updateReservation"
      @filterPhone="filterPhoneInput"
      @planChanged="onPlanChanged"
    />

    <!-- Modal Novedad -->
    <ModalNovedad
      v-if="showNovedadForm"
      :currentRestaurant="currentRestaurant"
      :formNovedad="formNovedad"
      @close="showNovedadForm = false"
      @save="saveNovedad"
      @imageUpload="onNovedadImageUpload"
    />
    <ModalNovedadDetalle
      v-if="showNovedadDetalle && novedadDetalle"
      :novedad="novedadDetalle"
      @close="closeNovedadDetalle"
    />

    <!-- Modal Briefing -->
    <ModalBriefing
      v-if="showBriefingForm"
      :currentRestaurant="currentRestaurant"
      :formBriefing="formBriefing"
      @close="showBriefingForm = false"
      @save="saveBriefing"
    />
    <ModalBriefingDetalle
      v-if="showBriefingDetalle && briefingDetalle"
      :briefing="briefingDetalle"
      @close="closeBriefingDetalle"
    />

    <!-- Toast -->
    <div class="app-toast-container" v-if="toastVisible">
      <div class="app-toast"><span>{{ toastMessage }}</span></div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import DataService from '../services/DataService.js'
import { formatDateToIso, ocasionesDisponibles, planesSelector } from '../services/helpers.js'

import SidebarComponent from '../components/SidebarComponent.vue'
import TopbarComponent from '../components/TopbarComponent.vue'
import MetricsComponent from '../components/MetricsComponent.vue'
import CalendarioTab from '../components/CalendarioTab.vue'
import ListaReservasTab from '../components/ListaReservasTab.vue'
import NovedadesTab from '../components/NovedadesTab.vue'
import BriefingTab from '../components/BriefingTab.vue'
import AjustesJefeTab from '../components/AjustesJefeTab.vue'
import ModalReserva from '../components/ModalReserva.vue'
import ModalNovedad from '../components/ModalNovedad.vue'
import ModalNovedadDetalle from '../components/ModalNovedadDetalle.vue'
import ModalBriefing from '../components/ModalBriefing.vue'
import ModalBriefingDetalle from '../components/ModalBriefingDetalle.vue'

// Para mostrar los nombres en la pantalla de inicio (ya vienen de la base)
const restaurantesLogin = DataService.getRestaurantes()

const ocasionesArr = ocasionesDisponibles
const planesSelectorArr = planesSelector

// Peso máximo de logos y cartas (Vercel solo deja 4.5 MB por petición)
const MAX_UPLOAD = 3 * 1024 * 1024

// Valores iniciales de los formularios
function nuevaReserva() {
  return {
    id: '',
    restaurante_id: '',
    fecha: '',
    hora: '14:00',
    numero_personas: 2,
    nombre_cliente: '',
    telefono_contacto: '',
    email_contacto: '',
    plan_id: '',
    plan: 'No aplica',
    ocasion: 'OTRO',
    descripcion_notas: '',
    postre_incluido: false,
    estado: 'CONFIRMADA'
  }
}

function nuevaNovedad() {
  return {
    nombre_realiza: '',
    nombre_dirigida: '',
    fecha: formatDateToIso(new Date()),
    asunto: '',
    descripcion: '',
    imagen_preview: '',
    prioridad: 'Media',
    tipo: 'Novedad del Personal'
  }
}

function nuevoBriefing() {
  return { no_hay: '', por_acabarse: '', impulsar: '', organizacion_servicio: '' }
}

function nuevoUsuario(restauranteId = '') {
  return { nombre_completo: '', email: '', password: '', restaurante_id: restauranteId, error: '' }
}

// ---------- Estado ----------
// Sesión
const isLoggedIn = ref(false)
const currentUser = ref(null)
const loginForm = ref({ email: '', password: '', error: '' })
const loginLoading = ref(false)
const showRecoverPassword = ref(false)
const recoverForm = ref({ email: '', message: '', error: '' })

// Datos que vienen del servidor
const restaurantes = ref([])
const planes = ref([])
const reservas = ref([])
const usuarios = ref([])
const novedades = ref([])
const briefings = ref([])
const restaurantLogos = ref({})
const restaurantCartas = ref({})
const adminMessages = ref({})

// Pantalla
const activeTab = ref('calendario')
const selectedRestaurantId = ref('')
const currentMonthDate = ref(new Date())
const selectedDateStr = ref(formatDateToIso(new Date()))
const toastMessage = ref('')
const toastVisible = ref(false)

// Ventanas y formularios
const showCreateModal = ref(false)
const showEditModal = ref(false)
const formReserva = ref(nuevaReserva())
const editRestaurantForm = ref({ id: '' })
const showAddUserForm = ref(false)
const newUserForm = ref(nuevoUsuario())
const filtroNovedad = ref('todas')
const busquedaNovedad = ref('')
const showNovedadForm = ref(false)
const showNovedadDetalle = ref(false)
const novedadDetalle = ref(null)
const formNovedad = ref(nuevaNovedad())
const showBriefingForm = ref(false)
const showBriefingDetalle = ref(false)
const briefingDetalle = ref(null)
const formBriefing = ref(nuevoBriefing())

// ---------- Ayudas ----------
function hoy() {
  return formatDateToIso(new Date())
}

function nombreActual() {
  return currentUser.value?.nombre_completo || 'Administrador'
}

function showToast(mensaje) {
  toastMessage.value = mensaje
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 3500)
}

// Guarda en el servidor. Si sale bien devuelve { value }, si falla avisa y devuelve null.
async function guardar(accion, mensajeOk) {
  try {
    const value = await accion()
    if (mensajeOk) showToast(mensajeOk)
    return { value }
  } catch (e) {
    showToast('No se pudo guardar: ' + e.message)
    return null
  }
}

function leerArchivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function nombreRestaurante(id) {
  const rest = restaurantes.value.find(r => r.id === id)
  return rest ? rest.nombre : 'Restaurante'
}

// ---------- Datos calculados ----------
const isJefe = computed(() => currentUser.value && currentUser.value.rol === 'JEFE')

const currentRestaurant = computed(() => {
  const rest = restaurantes.value.find(r => r.id === selectedRestaurantId.value)
  return rest || { nombre: 'Todos los restaurantes', direccion: '', telefono: '', hora_apertura: '', hora_cierre: '' }
})

const temas = {
  'innamorato-fusion': 'theme-innamorato',
  'cielo-rosa': 'theme-cielo-rosa',
  'casa-juarez': 'theme-casa-juarez'
}
const restaurantThemeClass = computed(() => temas[currentRestaurant.value.slug] || '')

const currentRestaurantLogo = computed(() => restaurantLogos.value[selectedRestaurantId.value] || '')
const currentRestaurantCarta = computed(() => restaurantCartas.value[selectedRestaurantId.value] || '')

const filteredReservas = computed(() => {
  if (isJefe.value && !selectedRestaurantId.value) return reservas.value
  return reservas.value.filter(r => r.restaurante_id === selectedRestaurantId.value)
})

const dayReservations = computed(() => {
  const delDia = filteredReservas.value.filter(r => r.fecha === selectedDateStr.value)
  return delDia.sort((a, b) => a.hora.localeCompare(b.hora))
})

const adminUsuarios = computed(() => usuarios.value.filter(u => u.rol === 'ADMINISTRADOR'))
const availablePlans = computed(() => planes.value.filter(p => p.restaurante_id === selectedRestaurantId.value))

const reservasDeHoy = computed(() => filteredReservas.value.filter(r => r.fecha === hoy()))
const metricTotalHoy = computed(() => reservasDeHoy.value.length)
const metricConfirmadasHoy = computed(() => reservasDeHoy.value.filter(r => r.estado === 'CONFIRMADA').length)
const metricComensalesHoy = computed(() => {
  const activas = reservasDeHoy.value.filter(r => r.estado !== 'CANCELADA')
  return activas.reduce((total, r) => total + Number(r.numero_personas || 0), 0)
})

const filteredNovedades = computed(() => {
  return novedades.value.filter(n => {
    if (selectedRestaurantId.value && n.restaurante_id !== selectedRestaurantId.value) return false
    if (filtroNovedad.value !== 'todas' && n.tipo !== filtroNovedad.value) return false
    if (busquedaNovedad.value && !n.asunto.toLowerCase().includes(busquedaNovedad.value.toLowerCase())) return false
    return true
  })
})

const filteredBriefings = computed(() => {
  let lista = briefings.value
  if (selectedRestaurantId.value) {
    lista = lista.filter(b => b.restaurante_id === selectedRestaurantId.value)
  }
  return [...lista].sort((a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion))
})

// ---------- Calendario ----------
const monthYearTitle = computed(() => {
  const texto = currentMonthDate.value.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})

function crearCelda(fecha, esOtroMes) {
  const iso = formatDateToIso(fecha)
  return {
    dayNumber: fecha.getDate(),
    dateStr: iso,
    isOtherMonth: esOtroMes,
    isToday: iso === hoy(),
    isSelected: iso === selectedDateStr.value,
    reservations: filteredReservas.value.filter(r => r.fecha === iso)
  }
}

const calendarGridCells = computed(() => {
  const year = currentMonthDate.value.getFullYear()
  const month = currentMonthDate.value.getMonth()
  const diasDelMes = new Date(year, month + 1, 0).getDate()
  const celdas = []

  // La semana empieza en lunes: cuántos días del mes anterior se ven antes del día 1
  const diasAntes = (new Date(year, month, 1).getDay() + 6) % 7
  for (let i = diasAntes; i > 0; i--) {
    celdas.push(crearCelda(new Date(year, month, 1 - i), true))
  }

  for (let dia = 1; dia <= diasDelMes; dia++) {
    celdas.push(crearCelda(new Date(year, month, dia), false))
  }

  // Se completa la última semana con días del mes siguiente
  const diasDespues = (7 - (celdas.length % 7)) % 7
  for (let dia = 1; dia <= diasDespues; dia++) {
    celdas.push(crearCelda(new Date(year, month + 1, dia), true))
  }

  return celdas
})

function prevMonth() {
  const fecha = currentMonthDate.value
  currentMonthDate.value = new Date(fecha.getFullYear(), fecha.getMonth() - 1, 1)
}

function nextMonth() {
  const fecha = currentMonthDate.value
  currentMonthDate.value = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 1)
}

function goToToday() {
  currentMonthDate.value = new Date()
  selectedDateStr.value = hoy()
}

function selectDate(celda) {
  selectedDateStr.value = celda.dateStr
}

// ---------- Sesión ----------
async function doLogin() {
  loginForm.value.error = ''
  const email = loginForm.value.email.trim()
  const password = loginForm.value.password
  if (!email || !password.trim()) {
    loginForm.value.error = 'Escribe tu correo y tu contraseña.'
    return
  }

  loginLoading.value = true
  try {
    const user = await DataService.login(email, password)
    const datos = await DataService.loadPrivate()

    restaurantes.value = datos.restaurantes
    planes.value = datos.planes
    reservas.value = datos.reservas
    usuarios.value = datos.usuarios
    novedades.value = datos.novedades
    briefings.value = datos.briefings
    restaurantLogos.value = datos.logos
    restaurantCartas.value = datos.cartas
    adminMessages.value = datos.mensajes

    currentUser.value = user
    isLoggedIn.value = true
    loginForm.value = { email: '', password: '', error: '' }

    if (user.rol === 'ADMINISTRADOR') {
      selectedRestaurantId.value = user.restaurante_id
      showToast('Bienvenido, ' + user.nombre_completo)
    } else {
      selectedRestaurantId.value = restaurantes.value[0]?.id || ''
      showToast('Bienvenido, Jefe. Ves todos los restaurantes.')
    }
  } catch (e) {
    DataService.logout()
    loginForm.value.error = e.status === 401 ? 'Correo o contraseña incorrectos.' : e.message
  } finally {
    loginLoading.value = false
  }
}

function doLogout() {
  DataService.logout()
  currentUser.value = null
  isLoggedIn.value = false
  activeTab.value = 'calendario'
  selectedRestaurantId.value = ''
  reservas.value = []
  restaurantes.value = []
  planes.value = []
  usuarios.value = []
  novedades.value = []
  briefings.value = []
}

async function doRecoverPassword() {
  recoverForm.value.error = ''
  recoverForm.value.message = ''
  const email = recoverForm.value.email.trim()
  if (!email) {
    recoverForm.value.error = 'Escribe tu correo.'
    return
  }

  try {
    const existe = await DataService.recoverPassword(email)
    if (existe) recoverForm.value.message = 'Te enviamos un enlace para recuperar tu contraseña.'
    else recoverForm.value.error = 'No encontramos ese correo.'
  } catch (e) {
    recoverForm.value.error = e.message
  }
}

function cancelRecover() {
  showRecoverPassword.value = false
  recoverForm.value = { email: '', message: '', error: '' }
}

// ---------- Reservas ----------
function checkPlanDessert(planId) {
  const plan = planes.value.find(p => p.id === planId)
  if (plan && plan.incluye_postre) formReserva.value.postre_incluido = true
}

function onPlanChanged() {
  checkPlanDessert(formReserva.value.plan_id)
}

function openCreateModal(fecha = null) {
  const planInicial = availablePlans.value[0]?.id || ''
  formReserva.value = {
    ...nuevaReserva(),
    restaurante_id: selectedRestaurantId.value,
    fecha: fecha || selectedDateStr.value || hoy(),
    plan_id: planInicial
  }
  checkPlanDessert(planInicial)
  showCreateModal.value = true
}

function openEditModal(reserva) {
  formReserva.value = { ...reserva }
  showEditModal.value = true
}

function filterPhoneInput() {
  formReserva.value.telefono_contacto = formReserva.value.telefono_contacto.replace(/\D/g, '').slice(0, 10)
}

function faltanDatosDeReserva() {
  return !formReserva.value.nombre_cliente.trim() || !formReserva.value.telefono_contacto.trim()
}

async function saveNewReservation() {
  if (faltanDatosDeReserva()) {
    alert('Escribe el nombre del cliente y su teléfono.')
    return
  }

  const reserva = {
    ...formReserva.value,
    restaurante_id: selectedRestaurantId.value,
    creado_por: nombreActual(),
    ultimo_editor: nombreActual(),
    updated_at: new Date().toISOString()
  }
  const guardada = await guardar(() => DataService.createReserva(reserva))
  if (!guardada) return

  reserva.id = guardada.value.id
  reservas.value.push(reserva)
  showCreateModal.value = false
  showToast('Reserva de ' + reserva.nombre_cliente + ' agregada.')
}

async function updateReservation() {
  if (faltanDatosDeReserva()) {
    alert('Escribe el nombre del cliente y su teléfono.')
    return
  }

  const posicion = reservas.value.findIndex(r => r.id === formReserva.value.id)
  if (posicion === -1) return

  const reserva = { ...formReserva.value, ultimo_editor: nombreActual(), updated_at: new Date().toISOString() }
  if (!(await guardar(() => DataService.updateReserva(reserva)))) return

  reservas.value[posicion] = reserva
  showEditModal.value = false
  showToast('Reserva de ' + reserva.nombre_cliente + ' actualizada.')
}

async function cancelReservation(reserva) {
  if (!confirm('¿Cancelar la reserva de ' + reserva.nombre_cliente + '?')) return

  const posicion = reservas.value.findIndex(r => r.id === reserva.id)
  if (posicion === -1) return

  const cancelada = {
    ...reservas.value[posicion],
    estado: 'CANCELADA',
    ultimo_editor: nombreActual(),
    updated_at: new Date().toISOString()
  }
  const mensaje = 'Reserva de ' + reserva.nombre_cliente + ' cancelada.'
  if (await guardar(() => DataService.updateReserva(cancelada), mensaje)) {
    reservas.value[posicion] = cancelada
  }
}

// ---------- Restaurantes (Jefe) ----------
function startEditRestaurant(rest) {
  editRestaurantForm.value = { ...rest }
}

async function saveRestaurantChanges() {
  const posicion = restaurantes.value.findIndex(r => r.id === editRestaurantForm.value.id)
  if (posicion === -1) return

  const rest = { ...restaurantes.value[posicion], ...editRestaurantForm.value }
  const mensaje = 'Restaurante ' + rest.nombre + ' actualizado.'
  if (!(await guardar(() => DataService.saveRestaurante(rest), mensaje))) return

  restaurantes.value[posicion] = rest
  editRestaurantForm.value.id = ''
}

// ---------- Cuentas (Jefe) ----------
function openAddUserForm() {
  newUserForm.value = nuevoUsuario(restaurantes.value[0]?.id || '')
  showAddUserForm.value = true
}

function cancelAddUser() {
  showAddUserForm.value = false
  newUserForm.value.error = ''
}

async function saveNewUser() {
  const form = newUserForm.value
  form.error = ''

  if (!form.nombre_completo.trim() || !form.email.trim() || !form.password.trim() || !form.restaurante_id) {
    form.error = 'Completa todos los campos.'
    return
  }
  if (form.password.length < 6) {
    form.error = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }
  if (usuarios.value.some(u => u.email.toLowerCase() === form.email.toLowerCase())) {
    form.error = 'Ya existe una cuenta con ese correo.'
    return
  }

  try {
    const nuevo = await DataService.addUsuario({
      nombre_completo: form.nombre_completo.trim(),
      email: form.email.trim(),
      password: form.password,
      restaurante_id: form.restaurante_id
    })
    usuarios.value = [...usuarios.value, nuevo]
    showAddUserForm.value = false
    showToast('Cuenta creada para ' + nuevo.nombre_completo + '.')
  } catch (e) {
    form.error = e.message
  }
}

async function deleteUser(userId) {
  const usuario = usuarios.value.find(u => u.id === userId)
  if (!usuario) return
  if (!confirm('¿Eliminar la cuenta de ' + usuario.nombre_completo + '?')) return

  const mensaje = 'Cuenta de ' + usuario.nombre_completo + ' eliminada.'
  if (await guardar(() => DataService.deleteUsuario(userId), mensaje)) {
    usuarios.value = usuarios.value.filter(u => u.id !== userId)
  }
}

// ---------- Logos ----------
function getRestaurantLogo(restId) {
  return restaurantLogos.value[restId] || ''
}

async function subirLogo(restId, file) {
  if (!file) return
  if (file.size > MAX_UPLOAD) {
    alert('La imagen pesa más de 3 MB.')
    return
  }

  const datos = await leerArchivo(file)
  if (await guardar(() => DataService.setLogo(restId, datos), 'Logo actualizado.')) {
    restaurantLogos.value = { ...restaurantLogos.value, [restId]: datos }
  }
}

function onLogoUpload(event) {
  subirLogo(selectedRestaurantId.value, event.target.files[0])
}

function onRestaurantLogoUpload(event, restId) {
  subirLogo(restId, event.target.files[0])
}

async function removeRestaurantLogo(restId) {
  if (!(await guardar(() => DataService.setLogo(restId, null), 'Logo eliminado.'))) return

  const logos = { ...restaurantLogos.value }
  delete logos[restId]
  restaurantLogos.value = logos
}

// ---------- Cartas ----------
function getRestaurantCarta(restId) {
  return restaurantCartas.value[restId] || ''
}

async function onCartaUpload(event, restId) {
  const file = event.target.files[0]
  if (!file) return
  if (file.type !== 'application/pdf') {
    alert('Sube un archivo PDF.')
    return
  }
  if (file.size > MAX_UPLOAD) {
    alert('El PDF pesa más de 3 MB.')
    return
  }

  const datos = await leerArchivo(file)
  if (await guardar(() => DataService.setCarta(restId, datos), 'Carta cargada.')) {
    restaurantCartas.value = { ...restaurantCartas.value, [restId]: datos }
  }
}

async function removeRestaurantCarta(restId) {
  if (!(await guardar(() => DataService.setCarta(restId, null), 'Carta eliminada.'))) return

  const cartas = { ...restaurantCartas.value }
  delete cartas[restId]
  restaurantCartas.value = cartas
}

// ---------- Mensaje para clientes ----------
function getAdminMsg(restId) {
  return adminMessages.value[restId] || ''
}

function setAdminMsg(restId, texto) {
  adminMessages.value = { ...adminMessages.value, [restId]: texto }
}

async function saveAdminMsg(restId) {
  const texto = adminMessages.value[restId] || ''
  await guardar(() => DataService.saveAdminMessage(restId, texto), 'Mensaje guardado para ' + nombreRestaurante(restId) + '.')
}

// ---------- Novedades ----------
function openNovedadForm() {
  formNovedad.value = nuevaNovedad()
  showNovedadForm.value = true
}

async function saveNovedad() {
  if (!formNovedad.value.asunto.trim() || !formNovedad.value.descripcion.trim()) {
    showToast('Completa el asunto y la descripción.')
    return
  }

  const novedad = {
    ...formNovedad.value,
    restaurante_id: selectedRestaurantId.value,
    fecha_creacion: new Date().toISOString()
  }
  const guardada = await guardar(() => DataService.addNovedad(novedad))
  if (!guardada) return

  novedad.id = guardada.value.id
  novedades.value = [...novedades.value, novedad]
  showNovedadForm.value = false
  showToast('Novedad registrada.')
}

function verNovedad(novedad) {
  novedadDetalle.value = novedad
  showNovedadDetalle.value = true
}

function closeNovedadDetalle() {
  showNovedadDetalle.value = false
  novedadDetalle.value = null
}

async function onNovedadImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    alert('Sube una imagen JPG o PNG.')
    return
  }
  formNovedad.value.imagen_preview = await leerArchivo(file)
}

// ---------- Briefings ----------
function openBriefingForm() {
  formBriefing.value = nuevoBriefing()
  showBriefingForm.value = true
}

async function saveBriefing() {
  const briefing = {
    ...formBriefing.value,
    restaurante_id: selectedRestaurantId.value,
    fecha: hoy(),
    fecha_creacion: new Date().toISOString()
  }
  const guardado = await guardar(() => DataService.addBriefing(briefing))
  if (!guardado) return

  briefing.id = guardado.value.id
  briefings.value = [...briefings.value, briefing]
  showBriefingForm.value = false
  showToast('Briefing guardado.')
}

function verBriefing(briefing) {
  briefingDetalle.value = briefing
  showBriefingDetalle.value = true
}

function closeBriefingDetalle() {
  showBriefingDetalle.value = false
  briefingDetalle.value = null
}
</script>
