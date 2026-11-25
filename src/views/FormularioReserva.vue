<template>
  <div class="formulario-page">
    <!-- TOP BAR -->
    <header class="pub-topbar">
      <div class="topbar-left">
        <div class="topbar-logo">🍽️</div>
        <div>
          <h1>RestoGest</h1>
          <p>Sistema de Reservas</p>
        </div>
      </div>
      <router-link class="btn-back" to="/reservar">&#8592; Volver a restaurantes</router-link>
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
        <div v-if="restaurante" class="rest-header-card">
          <div class="rest-logo-box">
            <img v-if="restaurantLogo" :src="restaurantLogo" :alt="restaurante.nombre">
            <span v-else>{{ restaurantEmoji }}</span>
          </div>
          <div class="rest-header-info">
            <h2>{{ restaurante.nombre }}</h2>
            <p>{{ restaurante.descripcion || '' }}</p>
            <div class="rest-header-meta">
              <span>📍 {{ restaurante.direccion || '' }}</span>
              <span>📞 {{ restaurante.telefono || '' }}</span>
              <span>🕐 {{ formatTimeTo12h(restaurante.hora_apertura) }} – {{ formatTimeTo12h(restaurante.hora_cierre) }}</span>
            </div>
          </div>
        </div>

        <!-- CARTA DEL RESTAURANTE -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-icon">📋</div>
            <div>
              <h3>Nuestra Carta</h3>
              <p>Consulta nuestros platos y menús disponibles</p>
            </div>
          </div>
          <div v-if="restaurantCarta">
            <iframe class="carta-pdf-frame" :src="restaurantCarta" :title="'Carta ' + (restaurante?.nombre || '')"></iframe>
          </div>
          <div v-else class="carta-no-pdf">
            <div class="icon">📋</div>
            <p>La carta de este restaurante aún no ha sido cargada.<br>Puedes consultar el menú directamente en el restaurante o por teléfono.</p>
          </div>
        </div>

        <!-- MENSAJE DEL ADMINISTRADOR -->
        <div v-if="adminMessage" class="section-card">
          <div class="section-header">
            <div class="section-header-icon">📢</div>
            <div>
              <h3>Información importante</h3>
              <p>Mensaje del restaurante para sus clientes</p>
            </div>
          </div>
          <div style="padding: 20px 24px;">
            <div class="admin-message-box">
              <div class="admin-message-label">📌 Aviso del restaurante</div>
              <div class="admin-message-text">{{ adminMessage }}</div>
            </div>
          </div>
        </div>

        <!-- FORMULARIO DE RESERVA -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-header-icon">📅</div>
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
                <label>Teléfono de Contacto <span>*</span> <small style="font-weight:400;color:#718096">(solo números, máx. 10)</small></label>
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
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1.5px dashed #e2e8f0;">
              <div class="form-group" style="margin-bottom: 8px;">
                <label style="font-size:0.9rem; font-weight:700; color:#1a2238;">
                  📎 Comprobante de Pago <span style="color:#e74c3c">*</span>
                </label>
                <p style="font-size:0.78rem;color:#718096;margin-top:2px;">
                  Sube una imagen (JPG, PNG, WEBP) o PDF de tu comprobante de pago. Se adjuntará a tu reserva y se incluirá en el comprobante descargable.
                </p>
              </div>

              <!-- Preview del archivo -->
              <div v-if="comprobanteFile" class="upload-preview">
                <div>
                  <img v-if="comprobanteIsImage" :src="comprobanteDataURL" alt="comprobante" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
                  <span v-else class="file-icon">📄</span>
                </div>
                <div class="upload-preview-info">
                  <div class="upload-preview-name">{{ comprobanteFile.name }}</div>
                  <div class="upload-preview-size">{{ formatBytes(comprobanteFile.size) }}</div>
                </div>
                <button class="btn-remove" @click="removeComprobante" title="Quitar archivo">🗑️</button>
              </div>

              <!-- Drop zone -->
              <div v-if="!comprobanteFile" class="upload-area" :class="{ dragover: isDragover }" :style="uploadAreaBorderStyle"
                   @dragover.prevent="isDragover = true" @dragleave="isDragover = false" @drop.prevent="onDrop">
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" @change="handleComprobanteChange">
                <div class="upload-icon">📤</div>
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
              <span v-else>✅ Confirmar Reserva</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PANTALLA DE ÉXITO -->
      <div v-if="showSuccess && confirmedReserva" class="success-screen">
        <div class="success-icon">✅</div>
        <h2>¡Reserva Confirmada!</h2>
        <p>Tu reserva ha sido registrada exitosamente. Descarga el comprobante para presentarlo el día de tu visita.</p>

        <!-- Badge de estado BD -->
        <div style="margin-bottom:20px;">
          <div v-if="confirmedReserva._guardadoEnBD" style="background:#d1fae5;color:#065f46;border:1.5px solid #6ee7b7;border-radius:10px;padding:10px 16px;font-size:0.84rem;font-weight:700;display:flex;align-items:center;gap:8px;">
            &#10003; Reserva guardada en la base de datos correctamente.
          </div>
          <div v-else style="background:#fef9c3;color:#854d0e;border:1.5px solid #fcd34d;border-radius:10px;padding:10px 16px;font-size:0.84rem;font-weight:700;display:flex;align-items:center;gap:8px;">
            &#9888; Guardado localmente. Se sincronizará cuando el servidor esté disponible.
          </div>
        </div>

        <!-- Resumen -->
        <div class="reservation-summary">
          <div class="summary-title">🧾 Resumen de tu Reserva</div>
          <div class="summary-grid">
            <div class="summary-item"><label>Restaurante</label><span>{{ confirmedReserva.restaurante_nombre }}</span></div>
            <div class="summary-item"><label>Fecha</label><span>{{ formatDate(confirmedReserva.fecha) }}</span></div>
            <div class="summary-item"><label>Hora</label><span>{{ formatTimeTo12h(confirmedReserva.hora) }}</span></div>
            <div class="summary-item"><label>Personas</label><span>{{ confirmedReserva.numero_personas }}</span></div>
            <div class="summary-item"><label>Nombre</label><span>{{ confirmedReserva.nombre_cliente }}</span></div>
            <div class="summary-item"><label>Teléfono</label><span>{{ confirmedReserva.telefono_contacto }}</span></div>
            <div class="summary-item"><label>Ocasión</label><span>{{ confirmedReserva.ocasion_label }}</span></div>
            <div class="summary-item"><label>Plan</label><span>Plan {{ confirmedReserva.plan }}</span></div>
            <div class="summary-item"><label>Postre</label><span>{{ confirmedReserva.postre_incluido ? '✅ Incluido' : '✗ No incluido' }}</span></div>
            <div class="summary-item"><label>Estado</label><span>🟡 PENDIENTE</span></div>
            <div v-if="confirmedReserva.descripcion_notas" class="summary-item" style="grid-column:1/-1;"><label>Notas</label><span>{{ confirmedReserva.descripcion_notas }}</span></div>
          </div>
        </div>

        <!-- Vista previa comprobante de pago -->
        <div v-if="comprobanteDataURL" style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:18px 20px; margin-bottom:20px; text-align:left;">
          <div style="font-size:0.72rem;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#718096;margin-bottom:10px;">
            📎 Comprobante de Pago Adjunto
          </div>
          <img v-if="comprobanteIsImage" :src="comprobanteDataURL" alt="comprobante de pago" style="max-width:100%;max-height:300px;object-fit:contain;border-radius:10px;border:1.5px solid #e2e8f0;">
          <div v-else style="display:flex;align-items:center;gap:12px;background:#fff;border:1.5px solid #e2e8f0;border-radius:8px;padding:12px 14px;">
            <span style="font-size:2rem;">📄</span>
            <div>
              <div style="font-weight:700;font-size:0.88rem;">{{ confirmedReserva.comprobante_nombre }}</div>
              <div style="font-size:0.75rem;color:#718096;">{{ comprobanteFile ? formatBytes(comprobanteFile.size) : '' }}</div>
            </div>
          </div>
        </div>

        <button class="btn-download" @click="downloadReserva">
          ⬇️ Descargar Comprobante de Reserva
        </button>
        <br>
        <router-link class="btn btn-secondary" to="/reservar" style="display:inline-flex; margin:0 auto; text-decoration:none;">
          &#8592; Hacer otra reserva
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
const restaurantEmoji = ref('🍽️')
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

const emojiMap = {
  '11111111-1111-1111-1111-111111111111': '🍝',
  '22222222-2222-2222-2222-222222222222': '🌸',
  '33333333-3333-3333-3333-333333333333': '🌮'
}

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
  restaurantEmoji.value = emojiMap[restauranteId.value] || '🍽️'
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
    showToast('⚠️ Por favor adjunta el comprobante de pago', 'error')
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
    showToast('¡Reserva registrada con éxito! 🎉', 'success')
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

  const css = '* { box-sizing:border-box; margin:0; padding:0; } body { font-family:"Segoe UI",Arial,sans-serif; background:#f5f7fb; padding:40px 20px; color:#2d3748; } .card { background:#fff; max-width:700px; margin:0 auto; border-radius:18px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.12); } .card-header { background:linear-gradient(135deg,#1a2238,#2c3652); color:#fff; padding:32px; } .card-header h1 { font-size:1.4rem; font-weight:800; margin-bottom:4px; } .card-header .sub { color:rgba(255,255,255,0.6); font-size:0.85rem; } .card-header .code { color:rgba(255,255,255,0.5); font-size:0.78rem; margin-top:6px; } .card-body { padding:32px; } .rest-name { font-size:1.3rem; font-weight:800; color:#c59b27; margin-bottom:20px; } .status-badge { display:inline-block; padding:5px 14px; border-radius:9999px; font-size:0.82rem; font-weight:700; background:#fef9c3; color:#854d0e; margin-bottom:20px; } .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; } .item label { display:block; font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#718096; letter-spacing:.5px; margin-bottom:4px; } .item span { font-size:0.92rem; font-weight:700; color:#2d3748; } .divider { height:1px; background:#e2e8f0; margin:20px 0; } .section-label { font-size:0.7rem; font-weight:700; text-transform:uppercase; color:#718096; letter-spacing:.5px; margin-bottom:8px; } .notas-section { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px; margin-bottom:20px; } .notas-section p { font-size:0.88rem; color:#4a5568; } .comprobante-section { margin-bottom:20px; } .footer { text-align:center; font-size:0.73rem; color:#a0aec0; padding:18px 32px; border-top:1px solid #e2e8f0; line-height:1.6; } .footer strong { color:#718096; } @media print { body{padding:0;background:#fff;} .card{box-shadow:none;border-radius:0;max-width:100%;} }'

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
  showToast('Comprobante descargado correctamente ✓', 'success')
}
</script>

<style scoped>
.formulario-page {
  font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
  background: #f5f7fb;
  color: #2d3748;
  min-height: 100vh;
}

/* TOPBAR */
.pub-topbar { background: #1a2238; padding: 14px 30px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; box-shadow: 0 2px 12px rgba(0,0,0,0.25); }
.topbar-left { display: flex; align-items: center; gap: 14px; }
.topbar-logo { background: linear-gradient(135deg, #c59b27, #9e7916); width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.pub-topbar h1 { font-size: 1.05rem; font-weight: 800; color: #fff; }
.pub-topbar p { font-size: 0.75rem; color: rgba(255,255,255,0.55); }
.btn-back { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); padding: 8px 16px; border-radius: 8px; font-family: inherit; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; display: flex; align-items: center; gap: 6px; }
.btn-back:hover { background: rgba(255,255,255,0.18); color: #fff; }

/* STEPS */
.pub-steps-bar { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 14px 30px; display: flex; align-items: center; }
.step { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 600; color: #718096; }
.step.active { color: #1a2238; }
.step.done { color: #27ae60; }
.step-num { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; }
.step.active .step-num { background: #c59b27; color: #fff; }
.step.done .step-num { background: #27ae60; color: #fff; font-size: 0.9rem; }
.step-line { width: 40px; height: 2px; background: #e2e8f0; margin: 0 10px; }

/* LAYOUT */
.page-content { max-width: 1000px; margin: 0 auto; padding: 36px 24px 80px; }

/* RESTAURANT HEADER */
.rest-header-card { background: #1a2238; border-radius: 18px; padding: 28px 30px; margin-bottom: 28px; display: flex; align-items: center; gap: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.14); position: relative; overflow: hidden; }
.rest-header-card::after { content: ''; position: absolute; right: -30px; top: -30px; width: 180px; height: 180px; border-radius: 50%; background: rgba(197,155,39,0.08); }
.rest-logo-box { width: 70px; height: 70px; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; flex-shrink: 0; border: 2px solid rgba(197,155,39,0.3); }
.rest-logo-box img { width: 100%; height: 100%; object-fit: cover; }
.rest-header-info { flex: 1; }
.rest-header-info h2 { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 6px; }
.rest-header-info p { color: rgba(255,255,255,0.6); font-size: 0.85rem; }
.rest-header-meta { display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap; }
.rest-header-meta span { font-size: 0.78rem; color: rgba(255,255,255,0.55); display: flex; align-items: center; gap: 5px; }

/* SECTION CARD */
.section-card { background: #fff; border-radius: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 24px; overflow: hidden; }
.section-header { padding: 18px 24px 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 10px; }
.section-header-icon { width: 36px; height: 36px; border-radius: 10px; background: #fef8e7; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
.section-header h3 { font-size: 1rem; font-weight: 700; color: #1a2238; }
.section-header p { font-size: 0.78rem; color: #718096; }
.carta-pdf-frame { width: 100%; height: 550px; border: none; display: block; }
.carta-no-pdf { padding: 50px 24px; text-align: center; color: #718096; }
.carta-no-pdf .icon { font-size: 3rem; margin-bottom: 12px; }
.carta-no-pdf p { font-size: 0.88rem; }

/* ADMIN MESSAGE */
.admin-message-box { background: linear-gradient(135deg, #fef8e7, #fffdf5); border: 1px solid rgba(197,155,39,0.3); border-left: 5px solid #c59b27; border-radius: 12px; padding: 20px 22px; }
.admin-message-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9e7916; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.admin-message-text { font-size: 0.92rem; color: #5a4a1e; line-height: 1.7; white-space: pre-wrap; }

/* FORM */
.form-section { padding: 24px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
@media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 0.82rem; font-weight: 600; color: #1a2238; }
.form-group label span { color: #e74c3c; margin-left: 2px; }
.form-control { border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 11px 14px; font-family: inherit; font-size: 0.9rem; color: #2d3748; background: #fff; transition: all 0.2s; width: 100%; }
.form-control:focus { outline: none; border-color: #c59b27; box-shadow: 0 0 0 3px rgba(197,155,39,0.12); }
textarea.form-control { resize: vertical; min-height: 90px; }
select.form-control { cursor: pointer; }
.form-control.invalid { border-color: #e74c3c; }
.field-error { font-size: 0.75rem; color: #e74c3c; margin-top: 2px; }
.has-error label { color: #e74c3c; }

/* SWITCH */
.switch-row { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px; cursor: pointer; }
.switch-label { font-size: 0.88rem; font-weight: 600; color: #1a2238; }
.switch-desc { font-size: 0.75rem; color: #718096; margin-top: 2px; }
.switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; inset: 0; background: #cbd5e0; border-radius: 24px; cursor: pointer; transition: 0.3s; }
.slider:before { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #fff; left: 3px; top: 3px; transition: 0.3s; }
.switch input:checked + .slider { background: #c59b27; }
.switch input:checked + .slider:before { transform: translateX(20px); }

/* UPLOAD */
.upload-area { border: 2.5px dashed #e2e8f0; border-radius: 12px; padding: 30px 20px; text-align: center; cursor: pointer; transition: all 0.25s; background: #fafafa; margin-bottom: 16px; position: relative; }
.upload-area:hover, .upload-area.dragover { border-color: #c59b27; background: #fef8e7; }
.upload-area input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
.upload-icon { font-size: 2.5rem; margin-bottom: 10px; }
.upload-title { font-size: 0.92rem; font-weight: 700; color: #1a2238; margin-bottom: 4px; }
.upload-sub { font-size: 0.78rem; color: #718096; }
.upload-preview { display: flex; align-items: center; gap: 14px; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.upload-preview-info { flex: 1; }
.upload-preview-name { font-size: 0.85rem; font-weight: 600; color: #065f46; }
.upload-preview-size { font-size: 0.75rem; color: #047857; }
.btn-remove { background: none; border: none; cursor: pointer; color: #dc2626; font-size: 1.1rem; padding: 4px; }
.upload-img-preview { width: 100%; max-height: 200px; object-fit: contain; border-radius: 8px; margin-top: 10px; border: 1.5px solid #e2e8f0; }

/* ACTIONS */
.actions-bar { display: flex; gap: 14px; justify-content: flex-end; padding: 20px 24px; border-top: 1px solid #e2e8f0; flex-wrap: wrap; }
.btn { padding: 13px 28px; border-radius: 10px; font-family: inherit; font-size: 0.9rem; font-weight: 700; cursor: pointer; border: none; transition: all 0.22s; display: flex; align-items: center; gap: 8px; }
.btn-primary { background: linear-gradient(90deg, #c59b27, #9e7916); color: #fff; box-shadow: 0 4px 14px rgba(197,155,39,0.3); }
.btn-primary:hover { background: linear-gradient(90deg, #d4a933, #c59b27); box-shadow: 0 6px 20px rgba(197,155,39,0.45); transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-secondary { background: #f1f5f9; color: #1a2238; border: 1.5px solid #e2e8f0; }
.btn-secondary:hover { background: #e2e8f0; }

/* SUCCESS SCREEN */
.success-screen { background: #fff; border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,0.14); padding: 50px 36px; text-align: center; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.success-icon { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #d1fae5, #a7f3d0); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 24px; box-shadow: 0 8px 24px rgba(39,174,96,0.25); }
.success-screen h2 { font-size: 1.7rem; font-weight: 800; color: #1a2238; margin-bottom: 10px; }
.success-screen > p { color: #718096; font-size: 0.95rem; line-height: 1.7; max-width: 450px; margin: 0 auto 28px; }
.reservation-summary { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; text-align: left; margin-bottom: 24px; }
.summary-title { font-size: 0.78rem; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #718096; margin-bottom: 14px; }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 500px) { .summary-grid { grid-template-columns: 1fr; } }
.summary-item label { display: block; font-size: 0.72rem; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
.summary-item span { font-size: 0.92rem; font-weight: 700; color: #1a2238; }
.btn-download { background: linear-gradient(90deg, #1a2238, #2c3652); color: #fff; padding: 14px 32px; border-radius: 10px; font-family: inherit; font-size: 0.95rem; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 10px; transition: all 0.22s; box-shadow: 0 4px 16px rgba(26,34,56,0.2); margin-bottom: 14px; }
.btn-download:hover { background: linear-gradient(90deg, #2c3652, #1a2238); box-shadow: 0 8px 24px rgba(26,34,56,0.3); transform: translateY(-1px); }

/* SPINNER */
.spinner { width: 20px; height: 20px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }

/* TOAST */
.pub-toast { position: fixed; bottom: 30px; right: 30px; background: #1a2238; color: #fff; padding: 14px 22px; border-radius: 12px; font-size: 0.88rem; font-weight: 600; box-shadow: 0 8px 28px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; z-index: 9999; transform: translateY(80px); opacity: 0; transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pub-toast.show { transform: translateY(0); opacity: 1; }
.pub-toast.success { background: #065f46; }
.pub-toast.error { background: #991b1b; }

@keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
