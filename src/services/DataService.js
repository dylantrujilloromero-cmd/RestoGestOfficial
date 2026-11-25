// Habla con la API del servidor (Express + Neon).
// Los restaurantes se cargan una vez al abrir la página; lo demás se pide cuando hace falta.

let token = null // solo en memoria: al recargar la página hay que volver a entrar
let restaurantes = []

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

// Hace la petición y devuelve el JSON. Si algo falla lanza un ApiError.
async function api(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = 'Bearer ' + token

  let respuesta
  try {
    respuesta = await fetch('/api' + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0)
  }

  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) throw new ApiError(datos.error || 'Error del servidor', respuesta.status)
  return datos
}

function buscarRestaurante(id) {
  return restaurantes.find(r => r.id === id)
}

// Solo el Jefe puede ver los usuarios; para los demás devolvemos una lista vacía
async function cargarUsuarios() {
  try {
    return await api('/usuarios')
  } catch (e) {
    if (e.status === 403) return []
    throw e
  }
}

const DataService = {
  // ---------- Públicos (no piden sesión) ----------
  async init() {
    restaurantes = await api('/restaurantes')
  },

  getRestaurantes() {
    return restaurantes
  },

  getRestaurantLogo(id) {
    return buscarRestaurante(id)?.logo || ''
  },

  getAdminMessage(id) {
    return buscarRestaurante(id)?.mensaje_admin || ''
  },

  async loadCarta(id) {
    const datos = await api('/restaurantes/' + id + '/carta')
    return datos.carta
  },

  crearReservaPublica(reserva) {
    return api('/reservas/publico', { method: 'POST', body: reserva })
  },

  buscarReservas(nombre) {
    return api('/reservas/buscar?nombre=' + encodeURIComponent(nombre))
  },

  async recoverPassword(email) {
    const datos = await api('/recover', { method: 'POST', body: { email } })
    return datos.found
  },

  // ---------- Sesión ----------
  async login(email, password) {
    const datos = await api('/login', { method: 'POST', body: { email, password } })
    token = datos.token
    return datos.user
  },

  logout() {
    token = null
  },

  // Todo lo que necesita el panel al entrar
  async loadPrivate() {
    const [rests, planes, reservas, usuarios, novedades, briefings] = await Promise.all([
      api('/restaurantes'),
      api('/planes'),
      api('/reservas'),
      cargarUsuarios(),
      api('/novedades'),
      api('/briefings')
    ])
    restaurantes = rests

    // Logos, mensajes y cartas se guardan por id de restaurante
    const logos = {}
    const mensajes = {}
    const cartas = {}
    for (const rest of rests) {
      if (rest.logo) logos[rest.id] = rest.logo
      if (rest.mensaje_admin) mensajes[rest.id] = rest.mensaje_admin
      if (rest.tiene_carta) cartas[rest.id] = await this.loadCarta(rest.id)
    }

    return { restaurantes: rests, planes, reservas, usuarios, novedades, briefings, logos, mensajes, cartas }
  },

  // ---------- Guardar (piden sesión). El servidor crea los ids y los devuelve en { id } ----------
  createReserva(reserva) {
    return api('/reservas', { method: 'POST', body: reserva })
  },

  updateReserva(reserva) {
    return api('/reservas/' + reserva.id, { method: 'PUT', body: reserva })
  },

  addNovedad(novedad) {
    return api('/novedades', { method: 'POST', body: novedad })
  },

  addBriefing(briefing) {
    return api('/briefings', { method: 'POST', body: briefing })
  },

  addUsuario(usuario) {
    return api('/usuarios', { method: 'POST', body: usuario })
  },

  deleteUsuario(id) {
    return api('/usuarios/' + id, { method: 'DELETE' })
  },

  // Cambia campos de un restaurante en el servidor y también en la copia local
  async patchRestaurante(id, campos) {
    await api('/restaurantes/' + id, { method: 'PATCH', body: campos })

    const local = buscarRestaurante(id)
    if (!local) return
    Object.assign(local, campos)
    if ('carta' in campos) local.tiene_carta = !!campos.carta
  },

  saveRestaurante(rest) {
    return this.patchRestaurante(rest.id, {
      nombre: rest.nombre,
      descripcion: rest.descripcion,
      direccion: rest.direccion,
      telefono: rest.telefono,
      email: rest.email,
      hora_apertura: rest.hora_apertura,
      hora_cierre: rest.hora_cierre,
      capacidad_maxima: Number(rest.capacidad_maxima) || 60,
      activo: rest.activo
    })
  },

  setLogo(id, imagen) {
    return this.patchRestaurante(id, { logo: imagen })
  },

  setCarta(id, pdf) {
    return this.patchRestaurante(id, { carta: pdf })
  },

  saveAdminMessage(id, mensaje) {
    return this.patchRestaurante(id, { mensaje_admin: mensaje })
  }
}

export default DataService
