// Servidor para producción (Hostinger y similares): sirve la web compilada y la API juntas.
//   npm run build && npm start
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
app.use(express.static(dist))
// Cualquier otra ruta la maneja Vue (/reservar, /formulario-reserva...)
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`RestoGest escuchando en el puerto ${port}`))
