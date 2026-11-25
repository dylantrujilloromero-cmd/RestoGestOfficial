// Utilidades compartidas

export function formatDateToIso(d) {
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatTimeTo12h(timeStr) {
  if (!timeStr) return ''
  let [h, m] = timeStr.split(':')
  let ampm = 'AM'
  h = parseInt(h, 10)
  if (h >= 12) { ampm = 'PM'; if (h > 12) h -= 12 }
  if (h === 0) h = 12
  return `${h}:${m} ${ampm}`
}

export function formatDisplayDate(dateIsoStr) {
  if (!dateIsoStr) return ''
  const [year, month, day] = dateIsoStr.split('-')
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatDate(d) {
  if (!d) return '--'
  const parts  = d.split('-')
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return parseInt(parts[2]) + ' de ' + months[parseInt(parts[1]) - 1] + ' de ' + parts[0]
}

export function formatBytes(b) {
  if (b < 1024)    return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

export function escapeHtml(str) {
  if (!str) return ''
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export const ocasionesDisponibles = [
  { id: 'OTRO',                 label: 'Sin ocasión especial' },
  { id: 'CUMPLEAÑOS',           label: 'Cumpleaños' },
  { id: 'ANIVERSARIO',          label: 'Aniversario' },
  { id: 'CITA_ROMANTICA',       label: 'Cita Romántica' },
  { id: 'REUNION_NEGOCIOS',     label: 'Grado' },
  { id: 'REUNION_FAMILIAR',     label: 'Solo Mesa' },
  { id: 'CELEBRACION_ESPECIAL', label: 'Pedida De Mano' }
]

export const ocasionesPublicas = [
  { id: 'OTRO',              label: 'Sin ocasión especial' },
  { id: 'CUMPLEAÑOS',        label: '🎂 Cumpleaños' },
  { id: 'ANIVERSARIO',       label: '💑 Aniversario' },
  { id: 'CITA_ROMANTICA',    label: '❤️ Cita Romántica' },
  { id: 'REUNION_FAMILIAR',  label: '👨‍👩‍👧 Reunión Familiar' },
  { id: 'REUNION_NEGOCIOS',  label: '💼 Reunión de Negocios' },
  { id: 'GRADUACION',        label: '🎓 Graduación' }
]

export const planesSelector = [
  { id: '30', label: 'Plan 30' },
  { id: '50', label: 'Plan 50' },
  { id: '60', label: 'Plan 60' },
  { id: '70', label: 'Plan 70' },
  { id: '80', label: 'Plan 80' },
  { id: 'No aplica', label: 'No aplica' }
]

export function getOccasionLabel(ocasionId) {
  const oc = ocasionesDisponibles.find(o => o.id === ocasionId)
  return oc ? oc.label : ocasionId
}
