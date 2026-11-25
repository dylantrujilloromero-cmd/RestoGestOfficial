<template>
  <!-- PANTALLA DE LOGIN -->
  <div v-if="!isLoggedIn" class="login-screen">
    <div class="login-card">
      <div class="login-logo">
        <h1 class="login-title">RestoGest</h1>
        <p class="login-subtitle">Sistema de Reservas Multirestaurante</p>
      </div>
      <div class="login-restaurants">
        <span>INNAMORATO FUSION</span>
        <span>CIELO ROSA</span>
        <span>CASA JUAREZ</span>
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
      title="➕ Añadir Nueva Reserva"
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
import { formatDateToIso, formatTimeTo12h, formatDisplayDate, ocasionesDisponibles, planesSelector, getOccasionLabel } from '../services/helpers.js'

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

const ocasionesArr = ocasionesDisponibles
const planesSelectorArr = planesSelector

// Auth
const isLoggedIn = ref(false)
const loginForm = ref({ email: '', password: '', error: '' })
const loginLoading = ref(false)
const showRecoverPassword = ref(false)
const recoverForm = ref({ email: '', message: '', error: '' })

// General
const activeTab = ref('calendario')
const toastMessage = ref('')
const toastVisible = ref(false)
const restaurantes = ref([])
const planes = ref([])
const reservas = ref([])
const usuarios = ref([])
const novedades = ref([])
const briefings = ref([])
const currentUser = ref(null)
const selectedRestaurantId = ref('')
const currentMonthDate = ref(new Date())
const selectedDateStr = ref(formatDateToIso(new Date()))

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const formReserva = ref({ id:'', restaurante_id:'', fecha:'', hora:'14:00', numero_personas:2, nombre_cliente:'', telefono_contacto:'', email_contacto:'', plan_id:'', plan:'No aplica', ocasion:'OTRO', descripcion_notas:'', postre_incluido:false, estado:'CONFIRMADA' })
const editRestaurantForm = ref({ id:'', nombre:'', direccion:'', telefono:'', email:'', hora_apertura:'', hora_cierre:'', capacidad_maxima:60, activo:true })
const showAddUserForm = ref(false)
const newUserForm = ref({ nombre_completo:'', email:'', password:'', restaurante_id:'', error:'' })

// Novedades / Briefings
const filtroNovedad = ref('todas')
const busquedaNovedad = ref('')
const showNovedadForm = ref(false)
const showNovedadDetalle = ref(false)
const novedadDetalle = ref(null)
const formNovedad = ref({ nombre_realiza:'', nombre_dirigida:'', fecha:'', asunto:'', descripcion:'', imagen:null, imagen_preview:'', prioridad:'Media', tipo:'Novedad del Personal' })
const showBriefingForm = ref(false)
const showBriefingDetalle = ref(false)
const briefingDetalle = ref(null)
const formBriefing = ref({ no_hay:'', por_acabarse:'', impulsar:'', organizacion_servicio:'' })

// Logos / Cartas / Mensajes: se cargan desde el servidor al iniciar sesión
const restaurantLogos = ref({})
const restaurantCartas = ref({})
const adminMessages = ref({})

// Guarda en el servidor. Devuelve { value } si salió bien; si falla avisa y devuelve null (la pantalla no se actualiza)
async function persist(action, okMsg) {
  try { const value = await action(); if (okMsg) showToast(okMsg); return { value } }
  catch (e) { showToast('❌ No se pudo guardar: ' + e.message); return null }
}
const MAX_UPLOAD = 3 * 1024 * 1024
const toDataURL = (file) => new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file) })

// COMPUTED
const isJefe = computed(() => currentUser.value && currentUser.value.rol === 'JEFE')
const currentRestaurant = computed(() => restaurantes.value.find(r => r.id === selectedRestaurantId.value) || { nombre:'Todos los Restaurantes', direccion:'', telefono:'', hora_apertura:'', hora_cierre:'' })
const restaurantThemeClass = computed(() => { const slug = currentRestaurant.value?.slug; const map = { 'innamorato-fusion':'theme-innamorato', 'cielo-rosa':'theme-cielo-rosa', 'casa-juarez':'theme-casa-juarez' }; return map[slug] || '' })
const currentRestaurantLogo = computed(() => restaurantLogos.value[selectedRestaurantId.value] || '')
const currentRestaurantCarta = computed(() => restaurantCartas.value[selectedRestaurantId.value] || '')
const filteredReservas = computed(() => { if (isJefe.value && !selectedRestaurantId.value) return reservas.value; return reservas.value.filter(r => r.restaurante_id === selectedRestaurantId.value) })
const dayReservations = computed(() => filteredReservas.value.filter(r => r.fecha === selectedDateStr.value).sort((a,b) => a.hora.localeCompare(b.hora)))
const adminUsuarios = computed(() => usuarios.value.filter(u => u.rol === 'ADMINISTRADOR'))
const metricTotalHoy = computed(() => { const t = formatDateToIso(new Date()); return filteredReservas.value.filter(r => r.fecha === t).length })
const metricConfirmadasHoy = computed(() => { const t = formatDateToIso(new Date()); return filteredReservas.value.filter(r => r.fecha === t && r.estado === 'CONFIRMADA').length })
const metricComensalesHoy = computed(() => { const t = formatDateToIso(new Date()); return filteredReservas.value.filter(r => r.fecha === t && r.estado !== 'CANCELADA').reduce((s,r) => s + Number(r.numero_personas||0), 0) })

const filteredNovedades = computed(() => novedades.value.filter(n => {
  if (selectedRestaurantId.value && n.restaurante_id !== selectedRestaurantId.value) return false
  if (filtroNovedad.value !== 'todas' && n.tipo !== filtroNovedad.value) return false
  if (busquedaNovedad.value && !n.asunto.toLowerCase().includes(busquedaNovedad.value.toLowerCase())) return false
  return true
}))
const filteredBriefings = computed(() => {
  let list = briefings.value
  if (selectedRestaurantId.value) list = list.filter(b => b.restaurante_id === selectedRestaurantId.value)
  return list.sort((a,b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()).reverse()
})

// Calendar
const monthYearTitle = computed(() => { const str = currentMonthDate.value.toLocaleDateString('es-ES', { month:'long', year:'numeric' }); return str.charAt(0).toUpperCase() + str.slice(1) })
const calendarGridCells = computed(() => {
  const year = currentMonthDate.value.getFullYear()
  const month = currentMonthDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month+1, 0)
  let startDow = firstDay.getDay() - 1; if (startDow === -1) startDow = 6
  const totalDays = lastDay.getDate()
  const cells = []
  const prevLast = new Date(year, month, 0).getDate()
  for (let i = startDow - 1; i >= 0; i--) {
    const d = prevLast - i; const dt = new Date(year, month-1, d); const iso = formatDateToIso(dt)
    cells.push({ dayNumber:d, dateStr:iso, isOtherMonth:true, isToday:iso===formatDateToIso(new Date()), isSelected:iso===selectedDateStr.value, reservations:getResForDate(iso) })
  }
  for (let d = 1; d <= totalDays; d++) {
    const dt = new Date(year, month, d); const iso = formatDateToIso(dt)
    cells.push({ dayNumber:d, dateStr:iso, isOtherMonth:false, isToday:iso===formatDateToIso(new Date()), isSelected:iso===selectedDateStr.value, reservations:getResForDate(iso) })
  }
  const rem = 7 - (cells.length % 7)
  if (rem < 7) for (let d = 1; d <= rem; d++) {
    const dt = new Date(year, month+1, d); const iso = formatDateToIso(dt)
    cells.push({ dayNumber:d, dateStr:iso, isOtherMonth:true, isToday:iso===formatDateToIso(new Date()), isSelected:iso===selectedDateStr.value, reservations:getResForDate(iso) })
  }
  return cells
})

function getResForDate(dateStr) { return filteredReservas.value.filter(r => r.fecha === dateStr) }
function prevMonth() { currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth()-1, 1) }
function nextMonth() { currentMonthDate.value = new Date(currentMonthDate.value.getFullYear(), currentMonthDate.value.getMonth()+1, 1) }
function goToToday() { currentMonthDate.value = new Date(); selectedDateStr.value = formatDateToIso(new Date()) }
function selectDate(cell) { selectedDateStr.value = cell.dateStr }

// AUTH
async function doLogin() {
  loginForm.value.error = ''
  if (!loginForm.value.email.trim() || !loginForm.value.password.trim()) { loginForm.value.error = 'Por favor ingresa tu correo y contraseña.'; return }
  loginLoading.value = true
  try {
    const user = await DataService.login(loginForm.value.email.trim(), loginForm.value.password)
    const d = await DataService.loadPrivate()
    restaurantes.value = d.restaurantes; planes.value = d.planes; reservas.value = d.reservas
    usuarios.value = d.usuarios; novedades.value = d.novedades; briefings.value = d.briefings
    restaurantLogos.value = d.logos; restaurantCartas.value = d.cartas; adminMessages.value = d.mensajes
    currentUser.value = user; isLoggedIn.value = true; loginForm.value = { email:'', password:'', error:'' }
    if (user.rol === 'ADMINISTRADOR') { selectedRestaurantId.value = user.restaurante_id; showToast(`✅ Bienvenido, ${user.nombre_completo}`) }
    else { selectedRestaurantId.value = restaurantes.value[0]?.id || ''; showToast('👑 Bienvenido, Jefe. Tienes acceso a los 3 restaurantes.') }
  } catch (e) {
    DataService.logout()
    loginForm.value.error = e.status === 401 ? 'Correo o contraseña incorrectos. Intenta de nuevo.' : e.message
  } finally { loginLoading.value = false }
}
function doLogout() { DataService.logout(); currentUser.value = null; isLoggedIn.value = false; activeTab.value = 'calendario'; selectedRestaurantId.value = ''; reservas.value = []; restaurantes.value = []; planes.value = []; usuarios.value = []; novedades.value = []; briefings.value = [] }
async function doRecoverPassword() {
  recoverForm.value.error = ''; recoverForm.value.message = ''
  if (!recoverForm.value.email.trim()) { recoverForm.value.error = 'Por favor ingresa tu correo.'; return }
  try {
    const found = await DataService.recoverPassword(recoverForm.value.email.trim())
    if (found) recoverForm.value.message = 'Se ha enviado un enlace de recuperación a tu correo.'
    else recoverForm.value.error = 'Correo no encontrado en el sistema.'
  } catch (e) { recoverForm.value.error = e.message }
}
function cancelRecover() { showRecoverPassword.value = false; recoverForm.value = { email:'', message:'', error:'' } }

// Toast
function showToast(msg) { toastMessage.value = msg; toastVisible.value = true; setTimeout(() => { toastVisible.value = false }, 3500) }

// CRUD Reservas
const availablePlans = computed(() => planes.value.filter(p => p.restaurante_id === selectedRestaurantId.value))

function checkPlanDessert(planId) {
  const plan = planes.value.find(p => p.id === planId)
  if (plan && plan.incluye_postre) formReserva.value.postre_incluido = true
}
function onPlanChanged() { checkPlanDessert(formReserva.value.plan_id) }

function openCreateModal(dateStr = null) {
  const target = dateStr || selectedDateStr.value || formatDateToIso(new Date())
  const defaultPlan = availablePlans.value[0]?.id || ''
  formReserva.value = { id:'', restaurante_id:selectedRestaurantId.value, fecha:target, hora:'14:00', numero_personas:2, nombre_cliente:'', telefono_contacto:'', email_contacto:'', plan_id:defaultPlan, plan:'No aplica', ocasion:'OTRO', descripcion_notas:'', postre_incluido:false, estado:'CONFIRMADA' }
  checkPlanDessert(defaultPlan)
  showCreateModal.value = true
}
function openEditModal(res) { formReserva.value = JSON.parse(JSON.stringify(res)); showEditModal.value = true }
async function saveNewReservation() {
  if (!formReserva.value.nombre_cliente.trim() || !formReserva.value.telefono_contacto.trim()) { alert('Por favor completa el nombre del cliente y el teléfono.'); return }
  const newRes = { ...formReserva.value, restaurante_id:selectedRestaurantId.value, creado_por:currentUser.value?.nombre_completo||'Administrador', ultimo_editor:currentUser.value?.nombre_completo||'Administrador', updated_at:new Date().toISOString() }
  const saved = await persist(() => DataService.createReserva(newRes))
  if (!saved) return
  newRes.id = saved.value.id
  reservas.value.push(newRes); showCreateModal.value = false; showToast(`✅ Reserva para "${newRes.nombre_cliente}" agregada.`)
}
async function updateReservation() {
  if (!formReserva.value.nombre_cliente.trim() || !formReserva.value.telefono_contacto.trim()) { alert('Por favor completa el nombre y teléfono.'); return }
  const idx = reservas.value.findIndex(r => r.id === formReserva.value.id)
  if (idx === -1) return
  const updated = { ...formReserva.value, ultimo_editor:currentUser.value?.nombre_completo||'Administrador', updated_at:new Date().toISOString() }
  if (!(await persist(() => DataService.updateReserva(updated)))) return
  reservas.value[idx] = updated; showEditModal.value = false; showToast(`Reserva de "${updated.nombre_cliente}" actualizada.`)
}
async function cancelReservation(res) {
  if (!confirm(`¿Cancelar la reserva de ${res.nombre_cliente}?`)) return
  const idx = reservas.value.findIndex(r => r.id === res.id)
  if (idx === -1) return
  const updated = { ...reservas.value[idx], estado:'CANCELADA', ultimo_editor:currentUser.value?.nombre_completo||'Administrador', updated_at:new Date().toISOString() }
  if (await persist(() => DataService.updateReserva(updated), `Reserva de ${res.nombre_cliente} marcada como CANCELADA.`)) reservas.value[idx] = updated
}
function filterPhoneInput() { formReserva.value.telefono_contacto = formReserva.value.telefono_contacto.replace(/\D/g,'').slice(0,10) }

// Restaurante Jefe
function startEditRestaurant(rest) { editRestaurantForm.value = JSON.parse(JSON.stringify(rest)) }
async function saveRestaurantChanges() {
  const idx = restaurantes.value.findIndex(r => r.id === editRestaurantForm.value.id)
  if (idx === -1) return
  const updated = { ...restaurantes.value[idx], ...editRestaurantForm.value }
  if (!(await persist(() => DataService.saveRestaurante(updated), `Restaurante "${updated.nombre}" actualizado.`))) return
  restaurantes.value[idx] = updated; editRestaurantForm.value.id = ''
}

// Usuarios
function openAddUserForm() { newUserForm.value = { nombre_completo:'', email:'', password:'', restaurante_id:restaurantes.value[0]?.id||'', error:'' }; showAddUserForm.value = true }
function cancelAddUser() { showAddUserForm.value = false; newUserForm.value.error = '' }
async function saveNewUser() {
  newUserForm.value.error = ''
  const { nombre_completo, email, password, restaurante_id } = newUserForm.value
  if (!nombre_completo.trim() || !email.trim() || !password.trim() || !restaurante_id) { newUserForm.value.error = 'Completa todos los campos.'; return }
  if (password.length < 6) { newUserForm.value.error = 'La contraseña debe tener al menos 6 caracteres.'; return }
  if (usuarios.value.find(u => u.email.toLowerCase() === email.toLowerCase())) { newUserForm.value.error = 'Ya existe una cuenta con ese correo.'; return }
  try {
    const nuevo = await DataService.addUsuario({ nombre_completo: nombre_completo.trim(), email: email.trim(), password, restaurante_id })
    usuarios.value = [...usuarios.value, nuevo]; showAddUserForm.value = false; showToast(`✅ Cuenta creada para "${nuevo.nombre_completo}".`)
  } catch (e) { newUserForm.value.error = e.message }
}
async function deleteUser(userId) {
  const user = usuarios.value.find(u => u.id === userId)
  if (!user) return; if (!confirm(`¿Eliminar la cuenta de "${user.nombre_completo}"?`)) return
  if (await persist(() => DataService.deleteUsuario(userId), `Cuenta de "${user.nombre_completo}" eliminada.`)) usuarios.value = usuarios.value.filter(u => u.id !== userId)
}
function getRestaurantName(restId) { const r = restaurantes.value.find(i => i.id === restId); return r ? r.nombre : 'Restaurante' }

// Logos
function getRestaurantLogo(restId) { return restaurantLogos.value[restId] || '' }
async function saveLogo(restId, file) {
  if (!file) return
  if (file.size > MAX_UPLOAD) { alert('La imagen supera el límite de 3 MB.'); return }
  const data = await toDataURL(file)
  if (await persist(() => DataService.setLogo(restId, data), '📷 Logo actualizado.')) restaurantLogos.value = { ...restaurantLogos.value, [restId]: data }
}
function onLogoUpload(event) { saveLogo(selectedRestaurantId.value, event.target.files[0]) }
function onRestaurantLogoUpload(event, restId) { saveLogo(restId, event.target.files[0]) }
async function removeRestaurantLogo(restId) {
  if (!(await persist(() => DataService.setLogo(restId, null), 'Logo eliminado.'))) return
  const rest = { ...restaurantLogos.value }; delete rest[restId]; restaurantLogos.value = rest
}

// Cartas
function getRestaurantCarta(restId) { return restaurantCartas.value[restId] || '' }
async function onCartaUpload(event, restId) {
  const file = event.target.files[0]; if (!file) return
  if (file.type !== 'application/pdf') { alert('Solo PDF.'); return }
  if (file.size > MAX_UPLOAD) { alert('El PDF supera el límite de 3 MB.'); return }
  const data = await toDataURL(file)
  if (await persist(() => DataService.setCarta(restId, data), '📄 Carta cargada.')) restaurantCartas.value = { ...restaurantCartas.value, [restId]: data }
}
async function removeRestaurantCarta(restId) {
  if (!(await persist(() => DataService.setCarta(restId, null), 'Carta eliminada.'))) return
  const rest = { ...restaurantCartas.value }; delete rest[restId]; restaurantCartas.value = rest
}

// Admin Messages
function getAdminMsg(restId) { return adminMessages.value[restId] || '' }
function setAdminMsg(restId, val) { adminMessages.value = { ...adminMessages.value, [restId]:val } }
async function saveAdminMsg(restId) { await persist(() => DataService.saveAdminMessage(restId, adminMessages.value[restId]||''), `✅ Mensaje guardado para ${getRestaurantName(restId)}`) }

// Novedades
function openNovedadForm() { formNovedad.value = { nombre_realiza:'', nombre_dirigida:'', fecha:formatDateToIso(new Date()), asunto:'', descripcion:'', imagen:null, imagen_preview:'', prioridad:'Media', tipo:'Novedad del Personal' }; showNovedadForm.value = true }
async function saveNovedad() {
  if (!formNovedad.value.asunto.trim() || !formNovedad.value.descripcion.trim()) { showToast('Completa los campos obligatorios'); return }
  const newNov = { ...formNovedad.value, restaurante_id:selectedRestaurantId.value, fecha_creacion:new Date().toISOString() }
  const saved = await persist(() => DataService.addNovedad(newNov))
  if (!saved) return
  newNov.id = saved.value.id
  novedades.value = [...novedades.value, newNov]; showNovedadForm.value = false; showToast('✅ Novedad registrada')
}
function verNovedad(nov) { novedadDetalle.value = nov; showNovedadDetalle.value = true }
function closeNovedadDetalle() { showNovedadDetalle.value = false; novedadDetalle.value = null }
function onNovedadImageUpload(event) {
  const file = event.target.files[0]; if (!file) return
  if (!['image/jpeg','image/png'].includes(file.type)) { alert('Solo JPG/PNG'); return }
  const reader = new FileReader(); reader.onload = (e) => { formNovedad.value.imagen_preview = e.target.result }; reader.readAsDataURL(file)
}

// Briefings
function openBriefingForm() { formBriefing.value = { no_hay:'', por_acabarse:'', impulsar:'', organizacion_servicio:'' }; showBriefingForm.value = true }
async function saveBriefing() {
  const newBrf = { ...formBriefing.value, restaurante_id:selectedRestaurantId.value, fecha_creacion:new Date().toISOString(), fecha:formatDateToIso(new Date()) }
  const saved = await persist(() => DataService.addBriefing(newBrf))
  if (!saved) return
  newBrf.id = saved.value.id
  briefings.value = [...briefings.value, newBrf]; showBriefingForm.value = false; showToast('✅ Briefing guardado')
}
function verBriefing(br) { briefingDetalle.value = br; showBriefingDetalle.value = true }
function closeBriefingDetalle() { showBriefingDetalle.value = false; briefingDetalle.value = null }
</script>
