// Crea las tablas en Neon. Se puede ejecutar varias veces sin problema.
//   npm run db:setup
//
// Solo crea la estructura. Los datos (restaurantes, planes, usuarios...) viven en la base de datos,
// no en el código: se cargan en Neon (por ejemplo con el SQL del dueño) o desde la app.
//
// Es el SQL del dueño (Base_De_Datos_Restaurantes.sql) pasado de MariaDB a PostgreSQL.
// Agregué unas columnas que necesita la web: slug, descripcion, logo, mensaje_admin y orden
// en restaurantes, e incluye_postre en planes_reserva.
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

// Crear las tablas
for (const sentencia of SCHEMA) {
  await query(sentencia)
}
console.log('Tablas listas')
