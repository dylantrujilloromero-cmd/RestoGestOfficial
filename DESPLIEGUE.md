# RestoGest: base de datos Neon y despliegue en Vercel

Arquitectura: **Vue (Vite)** + **API Express** (`server/`, se publica como función serverless en `api/`) + **Neon PostgreSQL**.
Todo se despliega en un solo proyecto de Vercel (gratis).

## 1. Crear la base de datos en Neon (una vez)
1. Crea el proyecto en https://console.neon.tech y pulsa **Connect**.
2. Copia la cadena de conexión (`postgresql://...?sslmode=require`).

## 2. Probar en tu PC
```powershell
Copy-Item .env.example .env      # y pega DATABASE_URL y un JWT_SECRET largo
npm run db:setup                 # crea las tablas (el SQL del dueño pasado a PostgreSQL), sin insertar datos
npm run api                      # terminal 1: API en http://localhost:3001
npm run dev                      # terminal 2: web en http://localhost:5173
```
Los datos (restaurantes, planes, usuarios, mensajes...) viven solo en Neon, no en el código. En una base vacía,
cárgalos en Neon (por ejemplo con el SQL del dueño en el *SQL Editor*) o créalos desde la app.

Para crear el primer Jefe en una base vacía (la contraseña se guarda con hash en la base):
```powershell
npm run db:jefe -- correo@ejemplo.com NuevaClave123 "Nombre del Jefe"
```
Después el Jefe crea las cuentas de administrador desde la app (*Ajustes y cuentas*).

Para cambiar la contraseña de alguien que ya existe:
```powershell
npm run db:clave -- correo@ejemplo.com NuevaClave123
```

## 3. Desplegar en Vercel
1. Sube el proyecto a GitHub (`.env` ya está en `.gitignore`).
2. En https://vercel.com → **Add New → Project** → importa el repositorio (Framework: Vite).
3. En **Environment Variables** añade `DATABASE_URL` y `JWT_SECRET` (el mismo valor que usaste en local, o uno nuevo).
4. **Deploy**. La web y la API quedan en la misma URL (`/api/...`).

## 3b. Alternativa: Hostinger Business (Node.js)
Hostinger Business admite apps Node.js. Aquí la web y la API corren juntas con `npm start` (`server/start.js`).
1. hPanel → **Sitios web → Añadir sitio web → Aplicación web Node.js**, y conecta el repositorio de GitHub (o sube un .zip sin `node_modules` ni `.env`).
2. Configuración: comando de build `npm run build`, archivo de entrada `server/start.js` (o comando `npm start`), Node 20 o superior.
3. En las **variables de entorno** del panel añade `DATABASE_URL` y `JWT_SECRET`.
4. Despliega. No hace falta cambiar nada más: la web llama a `/api` en el mismo dominio.

## Notas
- Límite de Vercel: 4.5 MB por petición, por eso logos, cartas y comprobantes admiten hasta 3 MB.
- La base gratuita de Neon se suspende tras unos minutos sin uso: la primera visita puede tardar 1-2 segundos más.
- "Recuperar contraseña" solo comprueba si el correo existe; no envía correos.
