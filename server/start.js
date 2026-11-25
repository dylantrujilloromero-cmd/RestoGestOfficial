// Servidor de producción para hosting con Node.js (Hostinger, Render, VPS...):
// sirve la web compilada (dist/) y la API en un solo proceso.   npm run build && npm start
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist')
app.use(express.static(dist))
// Cualquier otra ruta es de Vue Router (/reservar, /formulario-reserva...)
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`RestoGest escuchando en el puerto ${port}`))
