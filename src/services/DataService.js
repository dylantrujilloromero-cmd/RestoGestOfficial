// =============================================================================
// CAPA DE DATOS: cliente de la API de RestoGest (Express + Neon PostgreSQL)
// Los restaurantes se cargan una vez al iniciar (init) y se leen de forma
// síncrona; todo lo demás se pide / guarda en el servidor.
// =============================================================================

let token = null // solo en memoria: al recargar la página hay que volver a entrar
let restaurantes = []

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status }
}

async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch('/api' + path, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: 'Bearer ' + token })
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Error del servidor', res.status)
  return data
}

const byId = id => restaurantes.find(r => r.id === id)
const mapBy = (list, key) => Object.fromEntries(list.filter(r => r[key]).map(r => [r.id, r[key]]))

const DataService = {
  // ---- Públicos -----------------------------------------------------------
  async init() { restaurantes = await api('/restaurantes') },
  getRestaurantes() { return restaurantes },
  getRestaurantLogo(id) { return byId(id)?.logo || '' },
  getAdminMessage(id) { return byId(id)?.mensaje_admin || '' },
  async loadCarta(id) { return (await api(`/restaurantes/${id}/carta`)).carta },
  crearReservaPublica(payload) { return api('/reservas/publico', { method: 'POST', body: payload }) },
  buscarReservas(nombre) { return api('/reservas/buscar?nombre=' + encodeURIComponent(nombre)) },
  async recoverPassword(email) { return (await api('/recover', { method: 'POST', body: { email } })).found },

  // ---- Sesión -------------------------------------------------------------
  async login(email, password) {
    const data = await api('/login', { method: 'POST', body: { email, password } })
    token = data.token
    return data.user
  },
  logout() { token = null },

  // Todo lo que necesita el panel tras iniciar sesión
  async loadPrivate() {
    const [rests, planes, reservas, usuarios, novedades, briefings] = await Promise.all([
      api('/restaurantes'), api('/planes'), api('/reservas'),
      api('/usuarios').catch(e => { if (e.status === 403) return []; throw e }), // solo el Jefe
      api('/novedades'), api('/briefings')
    ])
    restaurantes = rests
    const conCarta = rests.filter(r => r.tiene_carta)
    const cartas = Object.fromEntries(await Promise.all(conCarta.map(async r => [r.id, await this.loadCarta(r.id)])))
    return {
      restaurantes: rests, planes, reservas, usuarios, novedades, briefings, cartas,
      logos: mapBy(rests, 'logo'), mensajes: mapBy(rests, 'mensaje_admin')
    }
  },

  // ---- Escritura (requieren sesión) --------------------------------------
  // Los ids (UUID) los genera el servidor; create* devuelven { id }
  createReserva(r) { return api('/reservas', { method: 'POST', body: r }) },
  updateReserva(r) { return api('/reservas/' + encodeURIComponent(r.id), { method: 'PUT', body: r }) },
  addNovedad(n) { return api('/novedades', { method: 'POST', body: n }) },
  addBriefing(b) { return api('/briefings', { method: 'POST', body: b }) },
  addUsuario(u) { return api('/usuarios', { method: 'POST', body: u }) },
  deleteUsuario(id) { return api('/usuarios/' + encodeURIComponent(id), { method: 'DELETE' }) },

  async patchRestaurante(id, fields) {
    await api('/restaurantes/' + id, { method: 'PATCH', body: fields })
    const local = byId(id)
    if (local) Object.assign(local, fields, 'carta' in fields ? { tiene_carta: !!fields.carta } : {})
  },
  saveRestaurante(r) {
    const { nombre, descripcion, direccion, telefono, email, hora_apertura, hora_cierre, capacidad_maxima, activo } = r
    return this.patchRestaurante(r.id, {
      nombre, descripcion, direccion, telefono, email, hora_apertura, hora_cierre,
      capacidad_maxima: Number(capacidad_maxima) || 60, activo
    })
  },
  setLogo(id, dataUrl) { return this.patchRestaurante(id, { logo: dataUrl }) },
  setCarta(id, dataUrl) { return this.patchRestaurante(id, { carta: dataUrl }) },
  saveAdminMessage(id, mensaje) { return this.patchRestaurante(id, { mensaje_admin: mensaje }) }
}

export default DataService
