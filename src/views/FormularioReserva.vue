<template>
  <div class="formulario-page">
    <!-- TOP BAR -->
    <header class="pub-topbar">
      <div class="topbar-left">
        <div class="topbar-logo"><i class="bi bi-cup-hot"></i></div>
        <div>
          <h1>RestoGest</h1>
          <p>Sistema de Reservas</p>
        </div>
      </div>
      <router-link class="btn-back" to="/reservar"><i class="bi bi-arrow-left"></i> Volver a restaurantes</router-link>
    </header>

    <!-- STEPS -->
    <div class="pub-steps-bar">
      <div class="step done">
        <div class="step-num">&#10003;</div>
        <span>Elegiste restaurante</span>
      </div>
      <div class="step-line"></div>
      <div class="step" :class="{ active: !showSuccess }">
        <div class="step-num">2</div>
        <span>Ver carta y reservar</span>
      </div>
      <div class="step-line"></div>
      <div class="step" :class="{ active: showSuccess }">
        <div class="step-num">3</div>
        <span>Confirmar y descargar</span>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="page-content">

      <!-- PANTALLA PRINCIPAL (form) -->
      <div v-if="!showSuccess">

        <!-- HEADER DEL RESTAURANTE -->
        <div v-if="restaurante" class="rest-header-card" :class="'t-' + restaurante.slug">
          <div class="rest-logo-box">
            <img v-if="restaurantLogo" :src="restaurantLogo" :alt="restaurante.nombre">
            <i v-else class="bi bi-shop"></i>
          </div>
          <div class="rest-header-info">
            <h2>{{ restaurante.nombre }}</h2>
            <p>{{ restaurante.descripcion || '' }}</p>
            <div class="rest-header-meta">
              <span><i class="bi bi-geo-alt"></i> {{ restaurante.direccion || '' }}</span>
              <span><i class="bi bi-telephone"></i> {{ restaurante.telefono || '' }}</span>
              <span><i class="bi bi-clock"></i> {{ formatTimeTo12h(restaurante.hora_apertura) }} – {{ formatTimeTo12h(restaurante.hora_cierre) }}</span>
            </div>
          </div>
        </div>

        <!-- CARTA DEL RESTAURANTE -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-icon"><i class="bi bi-journal-richtext"></i></div>
            <div>
              <h3>Nuestra Carta</h3>
              <p>Consulta nuestros platos y menús disponibles</p>
            </div>
          </div>
          <div v-if="restaurantCarta">
            <iframe class="carta-pdf-frame" :src="restaurantCarta" :title="'Carta ' + (restaurante?.nombre || '')"></iframe>
          </div>
          <div v-else class="carta-no-pdf">
            <div class="icon"><i class="bi bi-journal-x"></i></div>
            <p>La carta de este restaurante aún no ha sido cargada.<br>Puedes consultar el menú directamente en el restaurante o por teléfono.</p>
          </div>
        </div>

        <!-- MENSAJE DEL ADMINISTRADOR -->
        <div v-if="adminMessage" class="section-card">
          <div class="section-header">
            <div class="section-header-icon"><i class="bi bi-megaphone"></i></div>
            <div>
              <h3>Información importante</h3>
              <p>Mensaje del restaurante para sus clientes</p>
            </div>
          </div>
          <div style="padding: 20px 24px;">
            <div class="admin-message-box">
              <div class="admin-message-label"><i class="bi bi-pin-angle"></i> Aviso del restaurante</div>
              <div class="admin-message-text">{{ adminMessage }}</div>
            </div>
          </div>
        </div>

        <!-- FORMULARIO DE RESERVA -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-icon"><i class="bi bi-calendar-event"></i></div>
            <div>
              <h3>Formulario de Reserva</h3>
              <p>Completa los datos para apartar tu mesa</p>
            </div>
          </div>

          <div class="form-section">
            <div class="form-row">
              <div class="form-group" :class="{ 'has-error': errors.fecha }">
                <label>Fecha de Reserva <span>*</span></label>
                <input type="date" class="form-control" :class="{ invalid: errors.fecha }" v-model="form.fecha" :min="todayStr">
                <span v-if="errors.fecha" class="field-error">{{ errors.fecha }}</span>
              </div>
              <div class="form-group" :class="{ 'has-error': errors.hora }">
                <label>Hora <span>*</span></label>
                <input type="time" class="form-control" :class="{ invalid: errors.hora }" v-model="form.hora">
                <span v-if="errors.hora" class="field-error">{{ errors.hora }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" :class="{ 'has-error': errors.nombre }">
                <label>Nombre Completo <span>*</span></label>
                <input type="text" class="form-control" :class="{ invalid: errors.nombre }" v-model="form.nombre" placeholder="Ej: Juan Pérez">
                <span v-if="errors.nombre" class="field-error">{{ errors.nombre }}</span>
              </div>
              <div class="form-group" :class="{ 'has-error': errors.personas }">
                <label>Número de Personas <span>*</span></label>
                <input type="number" class="form-control" :class="{ invalid: errors.personas }" v-model="form.personas" min="1" max="50">
                <span v-if="errors.personas" class="field-error">{{ errors.personas }}</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" :class="{ 'has-error': errors.telefono }">
                <label>Teléfono de Contacto <span>*</span> <small class="text-secondary fw-normal">(solo números, máx. 10)</small></label>
                <input type="tel" class="form-control" :class="{ invalid: errors.telefono }" v-model="form.telefono" placeholder="3001234567" maxlength="10" @input="filterPhone">
                <span v-if="errors.telefono" class="field-error">{{ errors.telefono }}</span>
              </div>
              <div class="form-group">
                <label>Ocasión</label>
                <select class="form-control" v-model="form.ocasion">
                  <option v-for="oc in ocasionesPublicas" :key="oc.id" :value="oc.id">{{ oc.label }}</option>
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:16px;">
              <label>Plan de Reserva</label>
              <select class="form-control" v-model="form.plan">
                <option value="No aplica">Sin plan especial</option>
                <option value="30">Plan 30</option>
                <option value="50">Plan 50</option>
                <option value="60">Plan 60</option>
                <option value="70">Plan 70</option>
                <option value="80">Plan 80</option>
              </select>
            </div>

            <!-- Postre -->
            <label class="switch-row" for="inp-postre">
              <div>
                <div class="switch-label">¿Deseas incluir postre en la reserva?</div>
                <div class="switch-desc">Activa si deseas que se incluya postre para todos los comensales</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="inp-postre" v-model="form.postre">
                <span class="slider"></span>
              </label>
            </label>

            <!-- Notas -->
            <div class="form-group">
              <label>Peticiones especiales / Notas</label>
              <textarea class="form-control" rows="3" v-model="form.notas" placeholder="Ej: Mesa decorada, alergias, silla para bebé..."></textarea>
            </div>

            <!-- COMPROBANTE DE PAGO -->
            <div class="comprobante-block">
              <div class="form-group" style="margin-bottom: 8px;">
                <label>
                  <i class="bi bi-paperclip"></i> Comprobante de pago <span>*</span>
                </label>
                <p class="upload-help">
                  Sube una imagen (JPG, PNG, WEBP) o PDF de tu comprobante de pago. Se adjuntará a tu reserva y se incluirá en el comprobante descargable.
                </p>
              </div>

              <!-- Preview del archivo -->
              <div v-if="comprobanteFile" class="upload-preview">
                <div>
                  <img v-if="comprobanteIsImage" :src="comprobanteDataURL" alt="comprobante" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                  <span v-else class="file-icon"><i class="bi bi-file-earmark-pdf"></i></span>
                </div>
                <div class="upload-preview-info">
                  <div class="upload-preview-name">{{ comprobanteFile.name }}</div>
                  <div class="upload-preview-size">{{ formatBytes(comprobanteFile.size) }}</div>
                </div>
                <button class="btn-remove" @click="removeComprobante" title="Quitar archivo"><i class="bi bi-trash3"></i></button>
              </div>

              <!-- Drop zone -->
              <div v-if="!comprobanteFile" class="upload-area" :class="{ dragover: isDragover }" :style="uploadAreaBorderStyle"
                   @dragover.prevent="isDragover = true" @dragleave="isDragover = false" @drop.prevent="onDrop">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" @change="handleComprobanteChange">
                <div class="upload-icon"><i class="bi bi-cloud-arrow-up"></i></div>
                <div class="upload-title">Arrastra aquí tu comprobante o haz clic</div>
                <div class="upload-sub">JPG, PNG, WEBP, PDF — Máx. 3 MB</div>
              </div>

              <!-- Vista previa grande de imagen -->
              <div v-if="comprobanteIsImage && comprobanteDataURL" style="margin-bottom:16px;">
                <img :src="comprobanteDataURL" class="upload-img-preview" alt="Vista previa comprobante">
              </div>
            </div>
          </div>

          <!-- ACCIONES -->
          <div class="actions-bar">
            <router-link class="btn btn-secondary" to="/reservar" style="text-decoration:none;">Cancelar</router-link>
            <button class="btn btn-primary" :disabled="isSubmitting" @click="confirmarReserva">
              <div v-if="isSubmitting" class="spinner"></div>
              <span v-if="isSubmitting">Enviando reserva...</span>
              <span v-else><i class="bi bi-check2-circle"></i> Confirmar reserva</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PANTALLA DE ÉXITO -->
      <div v-if="showSuccess && confirmedReserva" class="success-screen">
        <div class="success-icon"><i class="bi bi-check-lg"></i></div>
        <h2>¡Reserva Confirmada!</h2>
        <p>Tu reserva ha sido registrada exitosamente. Descarga el comprobante para presentarlo el día de tu visita.</p>

        <!-- Badge de estado BD -->
        <div style="margin-bottom:20px;">
          <div v-if="confirmedReserva._guardadoEnBD" class="save-note ok">
            &#10003; Reserva guardada en la base de datos correctamente.
          </div>
          <div v-else class="save-note warn">
            &#9888; Guardado localmente. Se sincronizará cuando el servidor esté disponible.
          </div>
        </div>

        <!-- Resumen -->
        <div class="reservation-summary">
          <div class="summary-title"><i class="bi bi-receipt"></i> Resumen de tu reserva</div>
          <div class="summary-grid">
            <div class="summary-item"><label>Restaurante</label><span>{{ confirmedReserva.restaurante_nombre }}</span></div>
            <div class="summary-item"><label>Fecha</label><span>{{ formatDate(confirmedReserva.fecha) }}</span></div>
            <div class="summary-item"><label>Hora</label><span>{{ formatTimeTo12h(confirmedReserva.hora) }}</span></div>
            <div class="summary-item"><label>Personas</label><span>{{ confirmedReserva.numero_personas }}</span></div>
            <div class="summary-item"><label>Nombre</label><span>{{ confirmedReserva.nombre_cliente }}</span></div>
            <div class="summary-item"><label>Teléfono</label><span>{{ confirmedReserva.telefono_contacto }}</span></div>
            <div class="summary-item"><label>Ocasión</label><span>{{ confirmedReserva.ocasion_label }}</span></div>
            <div class="summary-item"><label>Plan</label><span>Plan {{ confirmedReserva.plan }}</span></div>
            <div class="summary-item"><label>Postre</label><span>{{ confirmedReserva.postre_incluido ? 'Incluido' : 'No incluido' }}</span></div>
            <div class="summary-item"><label>Estado</label><span class="pill-pending">Pendiente</span></div>
            <div v-if="confirmedReserva.descripcion_notas" class="summary-item" style="grid-column:1/-1;"><label>Notas</label><span>{{ confirmedReserva.descripcion_notas }}</span></div>
          </div>
        </div>

        <!-- Vista previa comprobante de pago -->
        <div v-if="comprobanteDataURL" class="proof-box">
          <div class="summary-title">
            <i class="bi bi-paperclip"></i> Comprobante de pago adjunto
          </div>
          <img v-if="comprobanteIsImage" :src="comprobanteDataURL" alt="comprobante de pago" class="proof-img">
          <div v-else class="proof-file">
            <span class="proof-file-icon"><i class="bi bi-file-earmark-pdf"></i></span>
            <div>
              <div style="font-weight:700;font-size:0.88rem;">{{ confirmedReserva.comprobante_nombre }}</div>
              <div style="font-size:0.75rem;color:#718096;">{{ comprobanteFile ? formatBytes(comprobanteFile.size) : '' }}</div>
            </div>
          </div>
        </div>

        <button class="btn-download" @click="downloadReserva">
          <i class="bi bi-download"></i> Descargar comprobante de reserva
        </button>
        <br>
        <router-link class="btn btn-secondary" to="/reservar" style="display:inline-flex; margin:0 auto; text-decoration:none;">
          <i class="bi bi-arrow-left"></i> Hacer otra reserva
        </router-link>
      </div>

    </div>

    <!-- TOAST -->
    <div class="pub-toast" :class="[toastType, { show: toastShow }]">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DataService from '../services/DataService.js'
import { formatTimeTo12h, formatDate, formatBytes, ocasionesPublicas } from '../services/helpers.js'

const route = useRoute()
const router = useRouter()
const restauranteId = computed(() => route.query.restaurante || '')
const restaurante = ref(null)
const restaurantLogo = ref('')
const restaurantCarta = ref('')
const adminMessage = ref('')

const todayStr = new Date().toISOString().split('T')[0]

const form = ref({
  fecha: todayStr, hora: '14:00', nombre: '', personas: 2,
  telefono: '', ocasion: 'OTRO', plan: 'No aplica', postre: false, notas: ''
})
const errors = ref({})
const isSubmitting = ref(false)
const showSuccess = ref(false)
const confirmedReserva = ref(null)

// Comprobante
const comprobanteFile = ref(null)
const comprobanteDataURL = ref(null)
const comprobanteIsImage = computed(() => comprobanteFile.value && comprobanteFile.value.type.startsWith('image/'))
const isDragover = ref(false)
const uploadAreaBorderStyle = ref('')

// Toast
const toastMsg = ref('')
const toastShow = ref(false)
const toastType = ref('')

const ocasionLabels = {
  'OTRO': 'Sin ocasión especial', 'CUMPLEAÑOS': 'Cumpleaños',
  'ANIVERSARIO': 'Aniversario', 'CITA_ROMANTICA': 'Cita Romántica',
  'REUNION_FAMILIAR': 'Reunión Familiar', 'REUNION_NEGOCIOS': 'Reunión de Negocios',
  'GRADUACION': 'Graduación'
}

onMounted(async () => {
  if (!restauranteId.value) { router.push('/reservar'); return }
  restaurante.value = DataService.getRestaurantes().find(r => r.id === restauranteId.value)
  if (!restaurante.value) { router.push('/reservar'); return }
  restaurantLogo.value = DataService.getRestaurantLogo(restauranteId.value)
  adminMessage.value = DataService.getAdminMessage(restauranteId.value) ||
    'Para confirmar tu reserva, realiza tu pago por transferencia o depósito y adjunta el comprobante en este formulario.\n\nTe contactaremos a tu número de teléfono para confirmar tu mesa.\n\n¡Gracias por elegirnos!'
  try { restaurantCarta.value = await DataService.loadCarta(restauranteId.value) } catch { restaurantCarta.value = '' }
})

function filterPhone() {
  form.value.telefono = form.value.telefono.replace(/\D/g, '').slice(0, 10)
}

function showToast(msg, type) {
  toastMsg.value = msg
  toastType.value = type || ''
  toastShow.value = true
  setTimeout(() => { toastShow.value = false }, 3500)
}

function handleComprobanteChange(e) {
  const file = e.target.files[0]
  if (file) processFile(file)
}

function onDrop(e) {
  isDragover.value = false
  if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])
}

function processFile(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  if (!allowed.includes(file.type)) {
    showToast('Solo se aceptan imágenes (JPG, PNG, WEBP) o PDF', 'error')
    return
  }
  if (file.size > 3 * 1024 * 1024) {
    showToast('El archivo supera el límite de 3 MB', 'error')
    return
  }
  comprobanteFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { comprobanteDataURL.value = ev.target.result }
  reader.readAsDataURL(file)
  uploadAreaBorderStyle.value = ''
}

function removeComprobante() {
  comprobanteFile.value = null
  comprobanteDataURL.value = null
  uploadAreaBorderStyle.value = ''
}

function validate() {
  errors.value = {}
  let ok = true
  if (!form.value.fecha) { errors.value.fecha = 'Selecciona la fecha'; ok = false }
  if (!form.value.hora) { errors.value.hora = 'Selecciona la hora'; ok = false }
  if (!form.value.nombre.trim()) { errors.value.nombre = 'Ingresa tu nombre completo'; ok = false }
  if (!form.value.personas) { errors.value.personas = 'Ingresa el número de personas'; ok = false }
  if (!form.value.telefono || form.value.telefono.length < 7) { errors.value.telefono = 'Ingresa el teléfono (mín. 7 dígitos)'; ok = false }
  if (!comprobanteFile.value) {
    showToast('Por favor adjunta el comprobante de pago', 'error')
    uploadAreaBorderStyle.value = 'border-color: #e74c3c'
    ok = false
  }
  return ok
}

async function confirmarReserva() {
  if (!validate()) return
  isSubmitting.value = true

  const payload = {
    restaurante_id: restauranteId.value,
    fecha: form.value.fecha,
    hora: form.value.hora,
    nombre_cliente: form.value.nombre.trim(),
    numero_personas: parseInt(form.value.personas) || 1,
    telefono_contacto: form.value.telefono.trim(),
    ocasion: form.value.ocasion,
    plan: form.value.plan,
    postre_incluido: form.value.postre,
    descripcion_notas: form.value.notas.trim(),
    comprobante_nombre: comprobanteFile.value.name,
    comprobante_datos: comprobanteDataURL.value
  }

  try {
    const saved = await DataService.crearReservaPublica(payload)
    confirmedReserva.value = {
      ...payload,
      id: saved.id,
      estado: 'PENDIENTE',
      created_at: saved.created_at,
      restaurante_nombre: restaurante.value.nombre,
      ocasion_label: ocasionLabels[form.value.ocasion] || 'Otro',
      _guardadoEnBD: true
    }
    showSuccess.value = true
    showToast('¡Reserva registrada con éxito!', 'success')
  } catch (err) {
    showToast('No se pudo registrar la reserva: ' + err.message, 'error')
  } finally {
    isSubmitting.value = false
  }
}

function downloadReserva() {
  const r = confirmedReserva.value
  if (!r) return

  const isImg = comprobanteFile.value && comprobanteFile.value.type.startsWith('image/')
  let comprobanteHtml = ''
  if (comprobanteDataURL.value) {
    if (isImg) {
      comprobanteHtml = '<div class="comprobante-section"><div class="section-label">Comprobante de Pago Adjunto</div><img src="' + comprobanteDataURL.value + '" alt="comprobante" style="max-width:100%;border-radius:10px;margin-top:8px;border:1.5px solid #e2e8f0;"></div>'
    } else {
      comprobanteHtml = '<div class="comprobante-section"><div class="section-label">Comprobante de Pago Adjunto</div><div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:12px;margin-top:8px;display:flex;align-items:center;gap:10px;"><span style="font-size:1.6rem;">&#128196;</span><span style="font-weight:700;color:#065f46;">' + r.comprobante_nombre + '</span></div></div>'
    }
  }
  const notasHtml = r.descripcion_notas ? '<div class="notas-section"><div class="section-label">Peticiones / Notas</div><p>' + r.descripcion_notas + '</p></div>' : ''

  const fechaGenerado = new Date().toLocaleString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const postre = r.postre_incluido ? '&#9989; Incluido' : 'No incluido'

  const css = '* { box-sizing:border-box; margin:0; padding:0; } body { font-family:"Segoe UI",Arial,sans-serif; background:#fbf8f4; padding:40px 20px; color:#2d3748; } .card { background:#fff; max-width:700px; margin:0 auto; border-radius:18px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); } .card-header { background:#ece8fb; color:#2f2a60; padding:32px; } .card-header h1 { font-size:1.4rem; font-weight:800; margin-bottom:4px; } .card-header .sub { color:rgba(47,42,96,0.65); font-size:0.85rem; } .card-header .code { color:rgba(47,42,96,0.55); font-size:0.78rem; margin-top:6px; } .card-body { padding:32px; } .rest-name { font-size:1.3rem; font-weight:800; color:#6f62c9; margin-bottom:20px; } .status-badge { display:inline-block; padding:5px 14px; border-radius:9999px; font-size:0.82rem; font-weight:700; background:#fbf0c4; color:#7d6310; margin-bottom:20px; } .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; } .item label { display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#718096; letter-spacing:.5px; margin-bottom:4px; } .item span { font-size:0.92rem; font-weight:700; color:#2d3748; } .divider { height:1px; background:#e2e8f0; margin:20px 0; } .section-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#718096; letter-spacing:.5px; margin-bottom:8px; } .notas-section { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:20px; } .notas-section p { font-size:0.88rem; color:#4a5568; } .comprobante-section { margin-bottom:20px; } .footer { text-align:center; font-size:0.73rem; color:#a0aec0; padding:18px 32px; border-top:1px solid #e2e8f0; line-height:1.6; } .footer strong { color:#718096; } @media print { body{padding:0;background:#fff;} .card{box-shadow:none;border-radius:0;max-width:100%;} }'

  const docHtml = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Comprobante Reserva</title><style>' + css + '</style></head><body>' +
    '<div class="card">' +
    '<div class="card-header">' +
    '<h1>&#127869; RestoGest &mdash; Comprobante de Reserva</h1>' +
    '<div class="sub">Sistema de Gesti&oacute;n de Reservas</div>' +
    '<div class="code">C&oacute;digo: #' + r.id + ' &nbsp;|&nbsp; Generado: ' + fechaGenerado + '</div>' +
    '</div>' +
    '<div class="card-body">' +
    '<div class="rest-name">&#127968; ' + r.restaurante_nombre + '</div>' +
    '<div class="status-badge">&#9203; PENDIENTE DE CONFIRMACI&Oacute;N</div>' +
    '<div class="grid">' +
    '<div class="item"><label>Fecha</label><span>' + formatDate(r.fecha) + '</span></div>' +
    '<div class="item"><label>Hora</label><span>' + formatTimeTo12h(r.hora) + '</span></div>' +
    '<div class="item"><label>Nombre</label><span>' + r.nombre_cliente + '</span></div>' +
    '<div class="item"><label>Personas</label><span>' + r.numero_personas + '</span></div>' +
    '<div class="item"><label>Tel&eacute;fono</label><span>' + r.telefono_contacto + '</span></div>' +
    '<div class="item"><label>Ocasi&oacute;n</label><span>' + r.ocasion_label + '</span></div>' +
    '<div class="item"><label>Plan</label><span>Plan ' + r.plan + '</span></div>' +
    '<div class="item"><label>Postre</label><span>' + postre + '</span></div>' +
    '</div>' +
    '<div class="divider"></div>' +
    notasHtml + comprobanteHtml +
    '<div class="divider"></div>' +
    '</div>' +
    '<div class="footer"><strong>Presentar este documento el d&iacute;a de la reserva</strong><br>' +
    'El restaurante se comunicar&aacute; al tel&eacute;fono indicado para confirmar tu mesa.<br>' +
    'RestoGest &copy; ' + new Date().getFullYear() + ' &mdash; Sistema de Reservas Multirestaurante</div>' +
    '</div></body></html>'

  const blob = new Blob([docHtml], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Reserva_' + r.restaurante_nombre.replace(/\s+/g, '_') + '_' + r.fecha + '.html'
  a.click()
  URL.revokeObjectURL(url)
  showToast('Comprobante descargado correctamente', 'success')
}
</script>

<style scoped>
.formulario-page { background: var(--cream); color: var(--ink); width: 100%; min-height: 100vh; }

/* BARRA SUPERIOR */
.pub-topbar { background: var(--paper); border-bottom: 1px solid var(--line); padding: 14px 30px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
.topbar-left { display: flex; align-items: center; gap: 12px; }
.topbar-logo { width: 38px; height: 38px; border-radius: 12px; background: var(--lilac); color: var(--lilac-ink); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.pub-topbar h1 { font-size: 1.2rem; margin: 0; line-height: 1.1; }
.pub-topbar p { font-size: 0.75rem; color: var(--ink-soft); margin: 0; }
.btn-back { background: var(--sand); color: var(--ink); padding: 8px 16px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
.btn-back:hover { background: #e9e2d9; color: var(--ink); }

/* PASOS */
.pub-steps-bar { background: var(--paper); border-bottom: 1px solid var(--line); padding: 12px 30px; display: flex; align-items: center; flex-wrap: wrap; gap: 6px 0; }
.step { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; font-weight: 700; color: #aaa6b8; }
.step.active { color: var(--ink); }
.step.done { color: var(--mint-ink); }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: var(--sand); color: var(--ink-soft); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; }
.step.active .step-num { background: var(--lilac); color: var(--lilac-ink); }
.step.done .step-num { background: var(--mint); color: var(--mint-ink); }
.step-line { width: 40px; height: 2px; background: var(--line); margin: 0 10px; }

.page-content { max-width: 960px; margin: 0 auto; padding: 32px 22px 80px; }

/* CABECERA DEL RESTAURANTE (color pastel según restaurante) */
.rest-header-card.t-innamorato-fusion { --c-bg: #f6c3bd; --c-ink: #5a211c; }
.rest-header-card.t-cielo-rosa { --c-bg: #f6c6dc; --c-ink: #5d1a3c; }
.rest-header-card.t-casa-juarez { --c-bg: #f6e3a1; --c-ink: #5a4806; }
.rest-header-card { --c-bg: var(--lilac); --c-ink: var(--lilac-ink); background: var(--c-bg); color: var(--c-ink); border-radius: 24px; padding: 26px 30px; margin-bottom: 24px; display: flex; align-items: center; gap: 20px; }
.rest-logo-box { width: 72px; height: 72px; border-radius: 18px; overflow: hidden; background: rgba(255,255,255,0.65); display: flex; align-items: center; justify-content: center; font-size: 2.3rem; flex-shrink: 0; }
.rest-logo-box img { width: 100%; height: 100%; object-fit: cover; }
.rest-header-info { flex: 1; }
.rest-header-info h2 { font-size: 1.7rem; margin: 0 0 4px; color: var(--c-ink); }
.rest-header-info p { margin: 0; font-size: 0.9rem; opacity: 0.8; }
.rest-header-meta { display: flex; gap: 8px 18px; margin-top: 12px; flex-wrap: wrap; }
.rest-header-meta span { font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 6px; opacity: 0.85; }

/* TARJETAS DE SECCIÓN */
.section-card { background: var(--paper); border: 1px solid var(--line); border-radius: 22px; margin-bottom: 22px; overflow: hidden; }
.section-header { padding: 18px 24px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 12px; }
.section-header-icon { width: 38px; height: 38px; border-radius: 12px; background: var(--lilac-soft); color: var(--lilac-deep); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.section-header h3 { font-size: 1.1rem; margin: 0; }
.section-header p { font-size: 0.8rem; color: var(--ink-soft); margin: 0; }
.carta-pdf-frame { width: 100%; height: 550px; border: none; display: block; }
.carta-no-pdf { padding: 46px 24px; text-align: center; color: var(--ink-soft); }
.carta-no-pdf .icon { font-size: 2.6rem; margin-bottom: 10px; color: #c9c3d8; }
.carta-no-pdf p { font-size: 0.9rem; margin: 0; }

.admin-message-box { background: var(--butter); border-radius: var(--radius-md); padding: 18px 22px; }
.admin-message-label { font-size: 0.72rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--butter-ink); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.admin-message-text { font-size: 0.93rem; color: #5b4a10; line-height: 1.7; white-space: pre-wrap; }

/* FORMULARIO */
.form-section { padding: 24px; }
.form-row { margin-bottom: 16px; }
.form-group label span { color: #d9737f; margin-left: 2px; }
.form-control.invalid { border-color: #e8949d; background: #fff8f8; }
.field-error { font-size: 0.76rem; color: var(--rose-ink); font-weight: 700; margin-top: 2px; }
.has-error label { color: var(--rose-ink); }

.switch-row { display: flex; align-items: center; justify-content: space-between; gap: 14px; background: var(--cream); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 16px; cursor: pointer; }
.switch-label { font-size: 0.9rem; font-weight: 700; }
.switch-desc { font-size: 0.78rem; color: var(--ink-soft); margin-top: 2px; }

/* COMPROBANTE */
.comprobante-block { margin-top: 24px; padding-top: 20px; border-top: 1px dashed #ddd3c8; }
.comprobante-block > .form-group > label { font-size: 0.95rem; }
.upload-help { font-size: 0.8rem; color: var(--ink-soft); margin: 2px 0 0; }
.upload-area { border: 2px dashed #d9d0c4; border-radius: var(--radius-md); padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.2s; background: var(--cream); margin-bottom: 16px; position: relative; }
.upload-area:hover, .upload-area.dragover { border-color: var(--lilac-deep); background: var(--lilac-soft); }
.upload-area input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.upload-icon { font-size: 2.2rem; color: var(--lilac-deep); margin-bottom: 6px; }
.upload-title { font-size: 0.95rem; font-weight: 800; margin-bottom: 2px; }
.upload-sub { font-size: 0.8rem; color: var(--ink-soft); }
.upload-preview { display: flex; align-items: center; gap: 14px; background: var(--mint); border-radius: var(--radius-md); padding: 12px 16px; margin-bottom: 16px; }
.file-icon { font-size: 1.8rem; color: var(--mint-ink); }
.upload-preview-info { flex: 1; }
.upload-preview-name { font-size: 0.88rem; font-weight: 800; color: var(--mint-ink); }
.upload-preview-size { font-size: 0.76rem; color: var(--mint-ink); opacity: 0.8; }
.btn-remove { background: none; border: none; cursor: pointer; color: var(--rose-ink); font-size: 1.1rem; padding: 4px 8px; border-radius: 8px; }
.btn-remove:hover { background: var(--rose); }
.upload-img-preview { width: 100%; max-height: 200px; object-fit: contain; border-radius: var(--radius-sm); margin-top: 10px; border: 1px solid var(--line); }

.actions-bar { display: flex; gap: 12px; justify-content: flex-end; padding: 18px 24px; border-top: 1px solid var(--line); background: var(--cream); flex-wrap: wrap; }
.actions-bar .btn { --bs-btn-padding-x: 1.5rem; --bs-btn-padding-y: 0.7rem; }

/* PANTALLA DE ÉXITO */
.success-screen { background: var(--paper); border: 1px solid var(--line); border-radius: 26px; padding: 46px 34px; text-align: center; animation: popIn 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.success-icon { width: 76px; height: 76px; border-radius: 50%; background: var(--mint); color: var(--mint-ink); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 22px; }
.success-screen h2 { font-size: 1.9rem; margin-bottom: 10px; }
.success-screen > p { color: var(--ink-soft); font-size: 0.97rem; line-height: 1.7; max-width: 460px; margin: 0 auto 24px; }
.save-note { display: flex; align-items: center; justify-content: center; gap: 8px; border-radius: var(--radius-md); padding: 10px 16px; font-size: 0.86rem; font-weight: 800; }
.save-note.ok { background: var(--mint); color: var(--mint-ink); }
.save-note.warn { background: var(--butter); color: var(--butter-ink); }
.reservation-summary { background: var(--cream); border-radius: var(--radius-md); padding: 22px; text-align: left; margin: 20px 0 22px; }
.summary-title { font-size: 0.74rem; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 14px; display: flex; align-items: center; gap: 6px; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.summary-item label { display: block; font-size: 0.7rem; font-weight: 800; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
.summary-item span { font-size: 0.95rem; font-weight: 800; }
.pill-pending { background: var(--butter); color: var(--butter-ink); padding: 2px 12px; border-radius: 9999px; font-size: 0.78rem !important; }
.proof-box { background: var(--cream); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 22px; text-align: left; }
.proof-img { max-width: 100%; max-height: 300px; object-fit: contain; border-radius: var(--radius-sm); border: 1px solid var(--line); }
.proof-file { display: flex; align-items: center; gap: 12px; background: var(--paper); border-radius: var(--radius-sm); padding: 12px 14px; }
.proof-file-icon { font-size: 1.8rem; color: var(--lilac-deep); }
.btn-download { background: var(--lilac); color: var(--lilac-ink); padding: 13px 30px; border-radius: 14px; font-size: 0.96rem; font-weight: 800; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s; margin-bottom: 14px; }
.btn-download:hover { background: #bfb4f0; }

.spinner { width: 18px; height: 18px; border: 2.5px solid rgba(47,42,96,0.25); border-top-color: var(--lilac-ink); border-radius: 50%; animation: spin 0.8s linear infinite; }

/* AVISO */
.pub-toast { position: fixed; bottom: 28px; right: 28px; background: var(--paper); color: var(--ink); padding: 13px 20px; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 700; box-shadow: var(--shadow-lg); border-left: 5px solid var(--lilac-deep); z-index: 9999; transform: translateY(80px); opacity: 0; transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-width: calc(100vw - 40px); }
.pub-toast.show { transform: translateY(0); opacity: 1; }
.pub-toast.success { border-left-color: #6fcf9d; }
.pub-toast.error { border-left-color: #e8949d; }

@keyframes popIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 600px) {
  .pub-topbar, .pub-steps-bar { padding-left: 16px; padding-right: 16px; }
  .rest-header-card { flex-direction: column; align-items: flex-start; padding: 22px; }
  .summary-grid { grid-template-columns: 1fr; }
}
</style>
