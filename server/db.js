import { neon } from '@neondatabase/serverless'

let _sql
// Conexión perezosa: así falla con un mensaje claro si falta DATABASE_URL
export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) throw new Error('Falta la variable de entorno DATABASE_URL')
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export const query = (text, params = []) => getSql().query(text, params)
