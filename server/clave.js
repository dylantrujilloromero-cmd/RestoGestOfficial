// Cambia la contraseña de un usuario que ya existe.
//   npm run db:clave -- correo@ejemplo.com NuevaClave123
import bcrypt from 'bcryptjs'
import { query } from './db.js'

const [email, clave] = process.argv.slice(2)

if (!email || !clave) {
  console.log('Uso: npm run db:clave -- correo@ejemplo.com NuevaClave123')
  process.exit(1)
}
if (clave.length < 8) {
  console.log('La contraseña debe tener al menos 8 caracteres.')
  process.exit(1)
}

const hash = await bcrypt.hash(clave, 10)
const cambiados = await query('UPDATE usuarios SET password_hash = $1 WHERE lower(email) = lower($2) RETURNING id', [hash, email])

if (cambiados.length === 0) console.log('No existe ningún usuario con ese correo.')
else console.log('Contraseña cambiada para ' + email)
