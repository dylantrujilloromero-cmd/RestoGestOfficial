// Crea las tablas en Neon (PostgreSQL) y carga los datos iniciales. Es seguro ejecutarlo varias veces.
//   npm run db:setup
//
// Es la versión PostgreSQL de "Base_De_Datos_Restaurantes.sql" (MariaDB) del dueño: mismas tablas,
// columnas, restricciones y datos. Cambios por el motor:
//   - UUID() -> gen_random_uuid()      - ON UPDATE CURRENT_TIMESTAMP -> trigger set_updated_at()
//   - LONGTEXT -> text                 - SHA2() -> bcrypt (lo recomienda la nota del propio script)
// Columnas añadidas porque la web las necesita: restaurantes (slug, descripcion, logo, mensaje_admin, orden)
// y planes_reserva (incluye_postre).
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

  // Equivalente a "ON UPDATE CURRENT_TIMESTAMP" de MariaDB
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

// [id, nombre, slug, descripcion, direccion, telefono, email, apertura, cierre, capacidad, orden, mensaje_admin]
const RESTAURANTES = [
  [R1, 'INNAMORATO FUSION', 'innamorato-fusion', 'Cocina fusión de autor con ambiente romántico y sabores únicos del mundo.', 'Av. Primavera 1020, Miraflores', '+51 987 654 321', 'contacto@innamoratofusion.com', '12:30:00', '23:30:00', 70, 1,
    'Para confirmar tu reserva en INNAMORATO FUSION, realiza tu pago por transferencia bancaria y adjunta el comprobante en este formulario.\n\nNos comunicaremos contigo vía telefónica para confirmar tu mesa.\n\n¡Gracias por elegirnos!'],
  [R2, 'CIELO ROSA', 'cielo-rosa', 'Experiencia gastronómica sofisticada con vista panorámica y cocina de temporada.', 'Calle Malecón de la Reserva 450', '+51 987 654 322', 'reservas@cielorosa.com', '12:00:00', '23:00:00', 50, 2,
    'Bienvenido a CIELO ROSA. Por favor adjunta tu comprobante de pago para apartar tu reserva.\n\nUn representante te contactará para confirmar disponibilidad.\n\n¡Te esperamos!'],
  [R3, 'CASA JUAREZ', 'casa-juarez', 'Tradición y sabor en cada platillo, con recetas auténticas y ambiente familiar.', 'Jr. Los Conquistadores 880, San Isidro', '+51 987 654 323', 'info@casajuarez.com', '13:00:00', '23:00:00', 65, 3,
    'Para reservar en CASA JUAREZ adjunta el comprobante de tu depósito o transferencia.\n\nRecuerda llegar puntual a tu hora de reserva.\n\n¡Nos vemos pronto!']
]

// Las contraseñas iniciales se pueden cambiar por variable de entorno al ejecutar el setup
const PASS_JEFE = process.env.SEED_JEFE_PASSWORD || 'Jefe123'
const PASS_ADMIN = process.env.SEED_ADMIN_PASSWORD || 'admin123'
// [id, restaurante_id, nombre, email, password, rol]
const USUARIOS = [
  ['55555555-5555-5555-5555-555555555551', null, 'Jefe General', 'jefe_restaurantes@gmail.com', PASS_JEFE, 'JEFE'],
  ['55555555-5555-5555-5555-555555555552', R1, 'Administrador Innamorato', 'admin.innamorato@reservas.com', PASS_ADMIN, 'ADMINISTRADOR'],
  ['55555555-5555-5555-5555-555555555553', R2, 'Administrador Cielo Rosa', 'admin.cielorosa@reservas.com', PASS_ADMIN, 'ADMINISTRADOR'],
  ['55555555-5555-5555-5555-555555555554', R3, 'Administrador Casa Juarez', 'admin.casajuarez@reservas.com', PASS_ADMIN, 'ADMINISTRADOR']
]

// [id, restaurante_id, nombre, descripcion, precio, incluye_postre]. Los dos primeros son los del SQL del dueño.
const PLANES = [
  ['66666666-6666-6666-6666-666666666661', R1, 'Plan Romántico Fusión', 'Plan especial romántico en INNAMORATO FUSION', 30000, true],
  ['66666666-6666-6666-6666-666666666662', R2, 'Aniversario Verano', 'Decoración romántica en CIELO ROSA', 50000, true],
  ['66666666-6666-6666-6666-666666666663', R1, 'Plan Degustación Innamorato', null, 0, true],
  ['66666666-6666-6666-6666-666666666664', R1, 'Reserva Estándar', null, 0, false],
  ['66666666-6666-6666-6666-666666666665', R2, 'Plan Vista Panorámica', null, 0, true],
  ['66666666-6666-6666-6666-666666666666', R2, 'Reserva Estándar Cielo Rosa', null, 0, false],
  ['66666666-6666-6666-6666-666666666667', R3, 'Plan Familiar Casa Juarez', null, 0, true],
  ['66666666-6666-6666-6666-666666666668', R3, 'Reserva Estándar Casa Juarez', null, 0, false]
]

for (const stmt of SCHEMA) await query(stmt)
console.log('✔ Tablas listas')

const [{ n }] = await query('SELECT count(*)::int AS n FROM restaurantes')
if (n > 0) {
  console.log('✔ Ya hay datos, no se vuelve a cargar el contenido inicial')
} else {
  for (const r of RESTAURANTES) {
    await query(`INSERT INTO restaurantes (id, nombre, slug, descripcion, direccion, telefono, email,
      hora_apertura, hora_cierre, capacidad_maxima, orden, mensaje_admin)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, r)
  }
  for (const [id, rid, nombre, email, pass, rol] of USUARIOS) {
    await query('INSERT INTO usuarios (id, restaurante_id, nombre, email, password_hash, rol) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, rid, nombre, email, await bcrypt.hash(pass, 10), rol])
  }
  for (const p of PLANES) {
    await query('INSERT INTO planes_reserva (id, restaurante_id, nombre, descripcion, precio, incluye_postre) VALUES ($1,$2,$3,$4,$5,$6)', p)
  }
  // Reservas de ejemplo del SQL del dueño (bórralas cuando ya no las necesites)
  await query(`INSERT INTO reservas (id, restaurante_id, plan_id, plan, creado_por_usuario_id, fecha, hora,
      numero_personas, nombre_cliente, telefono_contacto, email_contacto, ocasion) VALUES
    ('77777777-7777-7777-7777-777777777771', $1, '66666666-6666-6666-6666-666666666661', '50',
      '55555555-5555-5555-5555-555555555552', CURRENT_DATE, '14:00', 4, 'Juan Perez', '3001234567', 'juan@example.com', 'CUMPLEAÑOS'),
    ('77777777-7777-7777-7777-777777777772', $2, '66666666-6666-6666-6666-666666666662', '80',
      '55555555-5555-5555-5555-555555555553', CURRENT_DATE + 1, '20:00', 2, 'Maria Gomez', '3109876543', 'maria@example.com', 'ANIVERSARIO')`,
  [R1, R2])
  console.log('✔ Restaurantes, usuarios, planes y reservas de ejemplo cargados')
}
