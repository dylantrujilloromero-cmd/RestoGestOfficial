import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from './db.js'

const app = express()
app.use(express.json({ limit: '5mb' }))

// ---------------------------------------------------------------- utilidades
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('Falta la variable de entorno JWT_SECRET')
  return process.env.JWT_SECRET
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FECHA = /^\d{4}-\d{2}-\d{2}$/
const HORA = /^\d{2}:\d{2}(:\d{2})?$/
const PLANES_VALIDOS = ['30', '50', '60', '70', '80', 'No aplica']
const ESTADOS = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO ASISTIO']
const PRIORIDADES = ['Alta', 'Media', 'Baja']
const TIPOS_NOVEDAD = ['Novedad del Personal', 'Novedad del Establecimiento']

const vacioANull = v => (v === '' || v === undefined ? null : v)
const requireUuid = (id, msg = 'Identificador no válido') => { if (!UUID.test(String(id))) throw new HttpError(404, msg) }
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next)

function auth(req, _res, next) {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace(/^Bearer /, ''), secret())
    next()
  } catch {
    next(new HttpError(401, 'Sesión no válida o expirada'))
  }
}
const onlyJefe = (req, _res, next) =>
  req.user.rol === 'JEFE' ? next() : next(new HttpError(403, 'Solo el Jefe puede hacer esto'))

// El JEFE ve todos los restaurantes; los demás roles solo el suyo
const scopeRestaurante = (req, wanted) => (req.user.rol === 'JEFE' ? vacioANull(wanted) : req.user.restaurante_id)

// ---------------------------------------------------------------- consultas base
const HORA_FMT = col => `to_char(${col}, 'HH24:MI')`
const SELECT_RESERVAS = `SELECT r.id, r.restaurante_id, r.plan_id, r.plan,
    to_char(r.fecha, 'YYYY-MM-DD') AS fecha, ${HORA_FMT('r.hora')} AS hora, r.numero_personas,
    r.nombre_cliente, r.telefono_contacto, r.email_contacto, r.ocasion, r.descripcion_notas,
    r.postre_incluido, r.estado, r.comprobante_nombre,
    COALESCE(cu.nombre, 'Cliente (Público)') AS creado_por,
    COALESCE(eu.nombre, cu.nombre, 'Cliente (Público)') AS ultimo_editor,
    r.created_at, r.updated_at
  FROM reservas r
  LEFT JOIN usuarios cu ON cu.id = r.creado_por_usuario_id
  LEFT JOIN usuarios eu ON eu.id = r.ultimo_editor_usuario_id`

// Valida y normaliza los datos de una reserva (sirve para crear y para editar)
function datosReserva(b) {
  const personas = Number(b.numero_personas)
  const d = {
    plan_id: vacioANull(b.plan_id),
    plan: PLANES_VALIDOS.includes(b.plan) ? b.plan : 'No aplica',
    fecha: b.fecha, hora: b.hora, numero_personas: personas,
    nombre_cliente: String(b.nombre_cliente || '').trim(),
    telefono_contacto: String(b.telefono_contacto || '').trim(),
    email_contacto: vacioANull(b.email_contacto),
    ocasion: b.ocasion || 'OTRO',
    descripcion_notas: vacioANull(b.descripcion_notas),
    postre_incluido: !!b.postre_incluido,
    estado: b.estado
  }
  if (!d.nombre_cliente || !d.telefono_contacto || !FECHA.test(d.fecha) || !HORA.test(d.hora)
    || !Number.isInteger(personas) || personas < 1 || personas > 500) {
    throw new HttpError(400, 'Datos de reserva incompletos o inválidos')
  }
  if (!ESTADOS.includes(d.estado)) throw new HttpError(400, 'Estado no válido')
  if (d.plan_id && !UUID.test(d.plan_id)) throw new HttpError(400, 'Plan no válido')
  return d
}

async function insertReserva(d, extra) {
  const row = { ...d, ...extra }
  const cols = Object.keys(row)
  const [r] = await query(
    `INSERT INTO reservas (${cols.join(', ')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING id, created_at`,
    cols.map(c => row[c]))
  return r
}

// ---------------------------------------------------------------- públicas
app.get('/api/restaurantes', wrap(async (_req, res) => {
  res.json(await query(`SELECT id, nombre, slug, descripcion, direccion, telefono, email,
    ${HORA_FMT('hora_apertura')} AS hora_apertura, ${HORA_FMT('hora_cierre')} AS hora_cierre,
    capacidad_maxima, activo, logo, mensaje_admin, (carta_pdf_datos IS NOT NULL) AS tiene_carta
    FROM restaurantes ORDER BY orden, nombre`))
}))

app.get('/api/restaurantes/:id/carta', wrap(async (req, res) => {
  requireUuid(req.params.id, 'Restaurante no encontrado')
  const [r] = await query('SELECT carta_pdf_datos AS carta FROM restaurantes WHERE id = $1', [req.params.id])
  res.json({ carta: r?.carta || '' })
}))

app.post('/api/reservas/publico', wrap(async (req, res) => {
  const b = req.body || {}
  if (!UUID.test(String(b.restaurante_id))) throw new HttpError(400, 'Restaurante no válido')
  const [rest] = await query('SELECT id FROM restaurantes WHERE id = $1 AND activo', [b.restaurante_id])
  if (!rest) throw new HttpError(400, 'Restaurante no válido')
  const d = datosReserva({ ...b, estado: 'PENDIENTE', plan_id: null })
  if (!b.comprobante_datos?.startsWith('data:') || b.comprobante_datos.length > 6_500_000) {
    throw new HttpError(400, 'Comprobante inválido o demasiado grande')
  }
  const saved = await insertReserva(d, {
    restaurante_id: b.restaurante_id,
    comprobante_nombre: String(b.comprobante_nombre || '').slice(0, 255) || null,
    comprobante_datos: b.comprobante_datos
  })
  res.status(201).json(saved)
}))

// Consulta de estado por nombre: el teléfono se enmascara y no se devuelve el comprobante
app.get('/api/reservas/buscar', wrap(async (req, res) => {
  const nombre = String(req.query.nombre || '').trim()
  if (nombre.length < 3) throw new HttpError(400, 'Escribe al menos 3 caracteres')
  const like = '%' + nombre.replace(/[\\%_]/g, m => '\\' + m) + '%'
  res.json(await query(`SELECT id, restaurante_id, nombre_cliente, to_char(fecha, 'YYYY-MM-DD') AS fecha,
    ${HORA_FMT('hora')} AS hora, numero_personas, estado,
    '•••••' || right(telefono_contacto, 3) AS telefono_contacto
    FROM reservas WHERE nombre_cliente ILIKE $1 ORDER BY fecha DESC LIMIT 20`, [like]))
}))

app.post('/api/login', wrap(async (req, res) => {
  const { email = '', password = '' } = req.body || {}
  const [u] = await query('SELECT * FROM usuarios WHERE lower(email) = lower($1) AND activo', [String(email).trim()])
  if (!u || !(await bcrypt.compare(String(password), u.password_hash))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos')
  }
  const user = { id: u.id, nombre_completo: u.nombre, email: u.email, rol: u.rol, restaurante_id: u.restaurante_id }
  res.json({ token: jwt.sign(user, secret(), { expiresIn: '12h' }), user })
}))

// Igual que antes: solo indica si el correo existe (no se envía ningún correo real)
app.post('/api/recover', wrap(async (req, res) => {
  const [u] = await query('SELECT 1 FROM usuarios WHERE lower(email) = lower($1) AND activo', [String(req.body?.email || '').trim()])
  res.json({ found: !!u })
}))

// ---------------------------------------------------------------- protegidas
app.use('/api', auth)

app.get('/api/planes', wrap(async (req, res) => {
  res.json(await query(`SELECT id, restaurante_id, nombre, descripcion, precio, incluye_postre FROM planes_reserva
    WHERE activo AND ($1::uuid IS NULL OR restaurante_id = $1::uuid) ORDER BY nombre`, [scopeRestaurante(req, null)]))
}))

app.get('/api/reservas', wrap(async (req, res) => {
  res.json(await query(`${SELECT_RESERVAS} WHERE ($1::uuid IS NULL OR r.restaurante_id = $1::uuid)
    ORDER BY r.fecha, r.hora`, [scopeRestaurante(req, null)]))
}))

app.post('/api/reservas', wrap(async (req, res) => {
  const b = req.body || {}
  const rid = scopeRestaurante(req, b.restaurante_id)
  if (!rid || !UUID.test(rid)) throw new HttpError(400, 'Restaurante no válido')
  const saved = await insertReserva(datosReserva(b), {
    restaurante_id: rid, creado_por_usuario_id: req.user.id, ultimo_editor_usuario_id: req.user.id
  })
  res.status(201).json(saved)
}))

const CAMPOS_AUDITADOS = ['fecha', 'hora', 'numero_personas', 'nombre_cliente', 'telefono_contacto',
  'email_contacto', 'plan_id', 'plan', 'ocasion', 'descripcion_notas', 'postre_incluido', 'estado']

app.put('/api/reservas/:id', wrap(async (req, res) => {
  requireUuid(req.params.id, 'Reserva no encontrada')
  const [old] = await query(`${SELECT_RESERVAS} WHERE r.id = $1`, [req.params.id])
  if (!old || (req.user.rol !== 'JEFE' && old.restaurante_id !== req.user.restaurante_id)) {
    throw new HttpError(404, 'Reserva no encontrada')
  }
  const d = datosReserva(req.body || {})
  const cols = Object.keys(d)
  await query(`UPDATE reservas SET ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')},
    ultimo_editor_usuario_id = $${cols.length + 2} WHERE id = $1`,
  [req.params.id, ...cols.map(c => d[c]), req.user.id])

  // Historial: una fila por cada campo que cambió
  const norm = v => (v === null || v === undefined ? null : String(v).slice(0, 5000))
  for (const c of CAMPOS_AUDITADOS) {
    const antes = c === 'hora' ? norm(old[c])?.slice(0, 5) : norm(old[c])
    const despues = c === 'hora' ? norm(d[c])?.slice(0, 5) : norm(d[c])
    if (antes !== despues) {
      await query(`INSERT INTO historial_ediciones_reservas (reserva_id, usuario_id, campo_editado, valor_anterior, valor_nuevo)
        VALUES ($1, $2, $3, $4, $5)`, [req.params.id, req.user.id, c, antes, despues])
    }
  }
  res.json({ id: req.params.id })
}))

app.get('/api/novedades', wrap(async (req, res) => {
  res.json(await query(`SELECT id, restaurante_id, nombre_realiza, nombre_dirigida, to_char(fecha, 'YYYY-MM-DD') AS fecha,
    asunto, descripcion, imagen_datos AS imagen_preview, prioridad, tipo, created_at AS fecha_creacion
    FROM novedades WHERE ($1::uuid IS NULL OR restaurante_id = $1::uuid) ORDER BY created_at`, [scopeRestaurante(req, null)]))
}))

app.post('/api/novedades', wrap(async (req, res) => {
  const b = req.body || {}
  const rid = scopeRestaurante(req, b.restaurante_id)
  if (!rid || !UUID.test(rid)) throw new HttpError(400, 'Restaurante no válido')
  if (!String(b.asunto || '').trim()) throw new HttpError(400, 'El asunto es obligatorio')
  if (!PRIORIDADES.includes(b.prioridad) || !TIPOS_NOVEDAD.includes(b.tipo)) throw new HttpError(400, 'Prioridad o tipo no válido')
  const [saved] = await query(`INSERT INTO novedades (restaurante_id, nombre_realiza, nombre_dirigida, fecha, asunto,
    descripcion, imagen_datos, prioridad, tipo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
  [rid, b.nombre_realiza || '', b.nombre_dirigida || '', FECHA.test(b.fecha) ? b.fecha : new Date().toISOString().slice(0, 10),
    String(b.asunto).trim(), vacioANull(b.descripcion), vacioANull(b.imagen_preview), b.prioridad, b.tipo])
  res.status(201).json(saved)
}))

app.get('/api/briefings', wrap(async (req, res) => {
  res.json(await query(`SELECT id, restaurante_id, to_char(fecha, 'YYYY-MM-DD') AS fecha, no_hay, por_acabarse,
    impulsar, organizacion_servicio, created_at AS fecha_creacion
    FROM briefings WHERE ($1::uuid IS NULL OR restaurante_id = $1::uuid) ORDER BY created_at`, [scopeRestaurante(req, null)]))
}))

app.post('/api/briefings', wrap(async (req, res) => {
  const b = req.body || {}
  const rid = scopeRestaurante(req, b.restaurante_id)
  if (!rid || !UUID.test(rid)) throw new HttpError(400, 'Restaurante no válido')
  const [saved] = await query(`INSERT INTO briefings (restaurante_id, fecha, no_hay, por_acabarse, impulsar,
    organizacion_servicio) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
  [rid, FECHA.test(b.fecha) ? b.fecha : new Date().toISOString().slice(0, 10), vacioANull(b.no_hay),
    vacioANull(b.por_acabarse), vacioANull(b.impulsar), vacioANull(b.organizacion_servicio)])
  res.status(201).json(saved)
}))

// Campos de restaurantes que se pueden editar. "carta" se guarda en carta_pdf_datos / carta_pdf_nombre.
const RESTAURANTE_COLS = ['nombre', 'descripcion', 'direccion', 'telefono', 'email', 'hora_apertura',
  'hora_cierre', 'capacidad_maxima', 'activo', 'logo', 'mensaje_admin']

app.patch('/api/restaurantes/:id', wrap(async (req, res) => {
  requireUuid(req.params.id, 'Restaurante no encontrado')
  const esJefe = req.user.rol === 'JEFE'
  // Un administrador solo puede cambiar el logo de su propio restaurante
  if (!esJefe && req.user.restaurante_id !== req.params.id) throw new HttpError(403, 'Sin permiso')
  const body = req.body || {}
  const sets = []; const vals = [req.params.id]
  const add = (col, val) => { vals.push(val); sets.push(`${col} = $${vals.length}`) }
  for (const c of esJefe ? RESTAURANTE_COLS : ['logo']) {
    if (body[c] !== undefined) add(c, ['hora_apertura', 'hora_cierre', 'capacidad_maxima'].includes(c) ? vacioANull(body[c]) : body[c])
  }
  if (esJefe && body.carta !== undefined) {
    add('carta_pdf_datos', body.carta)
    add('carta_pdf_nombre', body.carta ? 'carta.pdf' : null)
  }
  if (!sets.length) throw new HttpError(400, 'Nada que actualizar')
  const out = await query(`UPDATE restaurantes SET ${sets.join(', ')} WHERE id = $1 RETURNING id`, vals)
  if (!out.length) throw new HttpError(404, 'Restaurante no encontrado')
  res.json({ ok: true })
}))

app.get('/api/usuarios', onlyJefe, wrap(async (_req, res) => {
  res.json(await query('SELECT id, nombre AS nombre_completo, email, rol, restaurante_id FROM usuarios WHERE activo ORDER BY nombre'))
}))

app.post('/api/usuarios', onlyJefe, wrap(async (req, res) => {
  const { nombre_completo = '', email = '', password = '', restaurante_id } = req.body || {}
  if (!nombre_completo.trim() || !email.trim() || password.length < 6 || !UUID.test(String(restaurante_id))) {
    throw new HttpError(400, 'Completa todos los campos (contraseña de al menos 6 caracteres)')
  }
  const [rest] = await query('SELECT 1 FROM restaurantes WHERE id = $1', [restaurante_id])
  if (!rest) throw new HttpError(400, 'Restaurante no válido')
  const [dup] = await query('SELECT 1 FROM usuarios WHERE lower(email) = lower($1)', [email.trim()])
  if (dup) throw new HttpError(409, 'Ya existe una cuenta con ese correo.')
  const [u] = await query(`INSERT INTO usuarios (nombre, email, password_hash, rol, restaurante_id)
    VALUES ($1, $2, $3, 'ADMINISTRADOR', $4) RETURNING id, nombre AS nombre_completo, email, rol, restaurante_id`,
  [nombre_completo.trim(), email.trim(), await bcrypt.hash(password, 10), restaurante_id])
  res.status(201).json(u)
}))

app.delete('/api/usuarios/:id', onlyJefe, wrap(async (req, res) => {
  requireUuid(req.params.id, 'Usuario no encontrado')
  if (req.params.id === req.user.id) throw new HttpError(400, 'No puedes eliminar tu propia cuenta')
  await query("DELETE FROM usuarios WHERE id = $1 AND rol <> 'JEFE'", [req.params.id])
  res.json({ ok: true })
}))

// ---------------------------------------------------------------- errores
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Ruta no encontrada')))
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status === 500) console.error(err)
  res.status(status).json({ error: status === 500 ? 'Error interno del servidor' : err.message })
})

export default app
