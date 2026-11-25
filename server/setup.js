// Crea las tablas en Neon y carga los datos iniciales. Se puede ejecutar varias veces sin problema.
//   npm run db:setup
//
// Es el SQL del dueño (Base_De_Datos_Restaurantes.sql) pasado de MariaDB a PostgreSQL.
// Agregué unas columnas que necesita la web: slug, descripcion, logo, mensaje_admin y orden
// en restaurantes, e incluye_postre en planes_reserva.
import bcrypt from 'bcryptjs'
import { query } from './db.js'

const TABLAS_CON_UPDATED_AT = ['restaurantes', 'usuarios', 'planes_reserva', 'reservas']

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS restaurantes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre varchar(100) NOT NULL,
    direccion varchar(255),
    telefono varchar(50),
    email varchar(100),
    hora_apertura time,
    hora_cierre time,
    capacidad_maxima integer,
    activo boolean DEFAULT true,
    carta_pdf_nombre varchar(255),
    carta_pdf_datos text,
    slug varchar(100) UNIQUE,
    descripcion text,
    logo text,
    mensaje_admin text,
    orden integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS usuarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE SET NULL,
    nombre varchar(100) NOT NULL,
    email varchar(100) UNIQUE NOT NULL,
    password_hash varchar(255) NOT NULL,
    rol varchar(50) NOT NULL CHECK (rol IN ('JEFE', 'ADMINISTRADOR', 'STAFF')),
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS planes_reserva (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre varchar(100) NOT NULL,
    descripcion text,
    precio numeric(12,2) DEFAULT 0.00,
    activo boolean DEFAULT true,
    incluye_postre boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE CASCADE,
    plan_id uuid REFERENCES planes_reserva(id) ON DELETE SET NULL,
    plan varchar(20) CHECK (plan IN ('30', '50', '60', '70', '80', 'No aplica')),
    creado_por_usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    ultimo_editor_usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha date NOT NULL,
    hora time NOT NULL,
    numero_personas integer NOT NULL,
    nombre_cliente varchar(150) NOT NULL,
    telefono_contacto varchar(50) NOT NULL,
    email_contacto varchar(100),
    ocasion varchar(100) DEFAULT 'OTRO',
    descripcion_notas text,
    postre_incluido boolean DEFAULT false,
    estado varchar(50) DEFAULT 'CONFIRMADA'
      CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA', 'NO ASISTIO')),
    comprobante_nombre varchar(255),
    comprobante_datos text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now())`,
  'CREATE INDEX IF NOT EXISTS reservas_rest_fecha_idx ON reservas (restaurante_id, fecha)',

  `CREATE TABLE IF NOT EXISTS historial_ediciones_reservas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reserva_id uuid REFERENCES reservas(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
    campo_editado varchar(100) NOT NULL,
    valor_anterior text,
    valor_nuevo text,
    fecha_edicion timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS novedades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE CASCADE,
    nombre_realiza varchar(200) NOT NULL,
    nombre_dirigida varchar(200) NOT NULL,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    asunto varchar(300) NOT NULL,
    descripcion text,
    imagen_nombre varchar(255),
    imagen_datos text,
    prioridad varchar(10) NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    tipo varchar(30) NOT NULL CHECK (tipo IN ('Novedad del Personal', 'Novedad del Establecimiento')),
    created_at timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS briefings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE CASCADE,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    no_hay text,
    por_acabarse text,
    impulsar text,
    organizacion_servicio text,
    created_at timestamptz DEFAULT now())`,

  `CREATE TABLE IF NOT EXISTS recuperar_password (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
    email varchar(255) NOT NULL,
    token varchar(255) NOT NULL,
    usado boolean DEFAULT false,
    created_at timestamptz DEFAULT now())`,

  `CREATE OR REPLACE VIEW vista_reservas_calendario AS
    SELECT r.id, r.restaurante_id, r.plan_id, r.plan, r.creado_por_usuario_id, r.ultimo_editor_usuario_id,
      r.fecha, r.hora, r.numero_personas, r.nombre_cliente, r.telefono_contacto, r.email_contacto,
      r.ocasion, r.descripcion_notas, r.postre_incluido, r.estado, r.comprobante_nombre, r.comprobante_datos,
      p.nombre AS nombre_plan, u.nombre AS nombre_usuario_creador
    FROM reservas r
    LEFT JOIN planes_reserva p ON r.plan_id = p.id
    LEFT JOIN usuarios u ON r.creado_por_usuario_id = u.id`,

  // Actualiza updated_at solo (en MariaDB era ON UPDATE CURRENT_TIMESTAMP)
  `CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql`,
  ...TABLAS_CON_UPDATED_AT.flatMap(t => [
    `DROP TRIGGER IF EXISTS ${t}_updated_at ON ${t}`,
    `CREATE TRIGGER ${t}_updated_at BEFORE UPDATE ON ${t} FOR EACH ROW EXECUTE FUNCTION set_updated_at()`
  ])
]

const R1 = '11111111-1111-1111-1111-111111111111'
const R2 = '22222222-2222-2222-2222-222222222222'
const R3 = '33333333-3333-3333-3333-333333333333'

const restaurantes = [
  {
    id: R1,
    nombre: 'INNAMORATO FUSION',
    slug: 'innamorato-fusion',
    descripcion: 'Cocina fusión de autor con ambiente romántico y sabores únicos del mundo.',
    direccion: 'Av. Primavera 1020, Miraflores',
    telefono: '+51 987 654 321',
    email: 'contacto@innamoratofusion.com',
    apertura: '12:30',
    cierre: '23:30',
    capacidad: 70,
    orden: 1,
    mensaje: 'Para confirmar tu reserva en INNAMORATO FUSION, realiza tu pago por transferencia bancaria y adjunta el comprobante en este formulario.\n\nNos comunicaremos contigo vía telefónica para confirmar tu mesa.\n\n¡Gracias por elegirnos!'
  },
  {
    id: R2,
    nombre: 'CIELO ROSA',
    slug: 'cielo-rosa',
    descripcion: 'Experiencia gastronómica sofisticada con vista panorámica y cocina de temporada.',
    direccion: 'Calle Malecón de la Reserva 450',
    telefono: '+51 987 654 322',
    email: 'reservas@cielorosa.com',
    apertura: '12:00',
    cierre: '23:00',
    capacidad: 50,
    orden: 2,
    mensaje: 'Bienvenido a CIELO ROSA. Por favor adjunta tu comprobante de pago para apartar tu reserva.\n\nUn representante te contactará para confirmar disponibilidad.\n\n¡Te esperamos!'
  },
  {
    id: R3,
    nombre: 'CASA JUAREZ',
    slug: 'casa-juarez',
    descripcion: 'Tradición y sabor en cada platillo, con recetas auténticas y ambiente familiar.',
    direccion: 'Jr. Los Conquistadores 880, San Isidro',
    telefono: '+51 987 654 323',
    email: 'info@casajuarez.com',
    apertura: '13:00',
    cierre: '23:00',
    capacidad: 65,
    orden: 3,
    mensaje: 'Para reservar en CASA JUAREZ adjunta el comprobante de tu depósito o transferencia.\n\nRecuerda llegar puntual a tu hora de reserva.\n\n¡Nos vemos pronto!'
  }
]

// Las contraseñas iniciales se pueden cambiar con estas variables al ejecutar el setup
const claveJefe = process.env.SEED_JEFE_PASSWORD || 'Jefe123'
const claveAdmin = process.env.SEED_ADMIN_PASSWORD || 'admin123'

const usuarios = [
  { id: '55555555-5555-5555-5555-555555555551', restaurante_id: null, nombre: 'Jefe General', email: 'jefe_restaurantes@gmail.com', password: claveJefe, rol: 'JEFE' },
  { id: '55555555-5555-5555-5555-555555555552', restaurante_id: R1, nombre: 'Administrador Innamorato', email: 'admin.innamorato@reservas.com', password: claveAdmin, rol: 'ADMINISTRADOR' },
  { id: '55555555-5555-5555-5555-555555555553', restaurante_id: R2, nombre: 'Administrador Cielo Rosa', email: 'admin.cielorosa@reservas.com', password: claveAdmin, rol: 'ADMINISTRADOR' },
  { id: '55555555-5555-5555-5555-555555555554', restaurante_id: R3, nombre: 'Administrador Casa Juarez', email: 'admin.casajuarez@reservas.com', password: claveAdmin, rol: 'ADMINISTRADOR' }
]

// Los dos primeros planes son los del SQL del dueño
const planes = [
  { id: '66666666-6666-6666-6666-666666666661', restaurante_id: R1, nombre: 'Plan Romántico Fusión', descripcion: 'Plan especial romántico en INNAMORATO FUSION', precio: 30000, incluye_postre: true },
  { id: '66666666-6666-6666-6666-666666666662', restaurante_id: R2, nombre: 'Aniversario Verano', descripcion: 'Decoración romántica en CIELO ROSA', precio: 50000, incluye_postre: true },
  { id: '66666666-6666-6666-6666-666666666663', restaurante_id: R1, nombre: 'Plan Degustación Innamorato', descripcion: null, precio: 0, incluye_postre: true },
  { id: '66666666-6666-6666-6666-666666666664', restaurante_id: R1, nombre: 'Reserva Estándar', descripcion: null, precio: 0, incluye_postre: false },
  { id: '66666666-6666-6666-6666-666666666665', restaurante_id: R2, nombre: 'Plan Vista Panorámica', descripcion: null, precio: 0, incluye_postre: true },
  { id: '66666666-6666-6666-6666-666666666666', restaurante_id: R2, nombre: 'Reserva Estándar Cielo Rosa', descripcion: null, precio: 0, incluye_postre: false },
  { id: '66666666-6666-6666-6666-666666666667', restaurante_id: R3, nombre: 'Plan Familiar Casa Juarez', descripcion: null, precio: 0, incluye_postre: true },
  { id: '66666666-6666-6666-6666-666666666668', restaurante_id: R3, nombre: 'Reserva Estándar Casa Juarez', descripcion: null, precio: 0, incluye_postre: false }
]

// Crear las tablas
for (const sentencia of SCHEMA) {
  await query(sentencia)
}
console.log('Tablas listas')

// Cargar los datos iniciales solo si la base está vacía
const [{ n }] = await query('SELECT count(*)::int AS n FROM restaurantes')
if (n > 0) {
  console.log('Ya hay datos, no se vuelve a cargar nada')
} else {
  for (const r of restaurantes) {
    await query(
      `INSERT INTO restaurantes (id, nombre, slug, descripcion, direccion, telefono, email,
        hora_apertura, hora_cierre, capacidad_maxima, orden, mensaje_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [r.id, r.nombre, r.slug, r.descripcion, r.direccion, r.telefono, r.email, r.apertura, r.cierre, r.capacidad, r.orden, r.mensaje]
    )
  }

  for (const u of usuarios) {
    await query(
      'INSERT INTO usuarios (id, restaurante_id, nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4, $5, $6)',
      [u.id, u.restaurante_id, u.nombre, u.email, await bcrypt.hash(u.password, 10), u.rol]
    )
  }

  for (const p of planes) {
    await query(
      'INSERT INTO planes_reserva (id, restaurante_id, nombre, descripcion, precio, incluye_postre) VALUES ($1, $2, $3, $4, $5, $6)',
      [p.id, p.restaurante_id, p.nombre, p.descripcion, p.precio, p.incluye_postre]
    )
  }

  // Dos reservas de ejemplo del SQL del dueño (bórralas cuando ya no las necesites)
  await query(
    `INSERT INTO reservas (id, restaurante_id, plan_id, plan, creado_por_usuario_id, fecha, hora,
       numero_personas, nombre_cliente, telefono_contacto, email_contacto, ocasion) VALUES
     ('77777777-7777-7777-7777-777777777771', $1, '66666666-6666-6666-6666-666666666661', '50',
       '55555555-5555-5555-5555-555555555552', CURRENT_DATE, '14:00', 4, 'Juan Perez', '3001234567', 'juan@example.com', 'CUMPLEAÑOS'),
     ('77777777-7777-7777-7777-777777777772', $2, '66666666-6666-6666-6666-666666666662', '80',
       '55555555-5555-5555-5555-555555555553', CURRENT_DATE + 1, '20:00', 2, 'Maria Gomez', '3109876543', 'maria@example.com', 'ANIVERSARIO')`,
    [R1, R2]
  )

  console.log('Restaurantes, usuarios, planes y reservas de ejemplo cargados')
}
