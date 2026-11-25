// Crea una cuenta de Jefe. Sirve para la primera vez, cuando la base está vacía.
//   npm run db:jefe -- correo@ejemplo.com NuevaClave123 "Nombre del Jefe"
import bcrypt from 'bcryptjs'
import { query } from './db.js'

const [email, clave, nombre = 'Jefe'] = process.argv.slice(2)

if (!email || !clave) {
  console.log('Uso: npm run db:jefe -- correo@ejemplo.com NuevaClave123 "Nombre del Jefe"')
  process.exit(1)
}
if (clave.length < 8) {
  console.log('La contraseña debe tener al menos 8 caracteres.')
  process.exit(1)
}

const existe = await query('SELECT 1 FROM usuarios WHERE lower(email) = lower($1)', [email])
if (existe.length > 0) {
  console.log('Ya existe un usuario con ese correo. Para cambiar su contraseña usa: npm run db:clave')
  process.exit(1)
}

await query(
  "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, 'JEFE')",
  [nombre, email, await bcrypt.hash(clave, 10)]
)
console.log('Jefe creado: ' + email)
