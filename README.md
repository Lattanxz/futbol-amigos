# Futbol Amigos

App web para registrar y llevar el historial de los partidos de fútbol amateur que juega un grupo de amigos. Pensada para cargar cada partido después de jugarlo (o en vivo): quiénes jugaron, cómo se armaron los equipos y formaciones, quién metió goles y asistencias, el resultado, y las estadísticas históricas de cada jugador.

## ¿Para qué sirve?

- **Jugadores**: alta, edición y baja (protegida: no se puede borrar a alguien que ya tiene partidos, goles o tarjetas cargados), con perfil y estadísticas acumuladas (partidos jugados, goles, asistencias, % de victorias).
- **Partidos**: wizard de carga en pasos — fecha y cancha, armar los dos equipos, elegir formación y ubicar a cada jugador tocando la cancha, cargar el resultado con goles/asistencias, y tarjetas (opcional).
- **Historial**: listado de partidos con filtros por cancha, jugador y fecha.
- **Detalle de partido**: cancha visual con la formación de ambos equipos, goleadores, asistencias y tarjetas. Solo quien cargó el partido puede editarlo o borrarlo.
- **Ranking del grupo**: goleador histórico, más asistencias, más partidos jugados y mejor % de victorias.
- **Usuarios**: login simple (registro con nombre, email y contraseña), pensado para un grupo cerrado de amigos.

Diseño mobile-first, pensado para cargarse desde el celular apenas termina el partido.

## Stack

- **Backend**: ASP.NET Core (.NET 10) + Entity Framework Core + PostgreSQL (hosteado en [Neon](https://neon.tech)), autenticación JWT. Deployado en [Render](https://render.com) (Docker).
- **Frontend**: React + Vite + TypeScript + Tailwind CSS. Deployado en [Vercel](https://vercel.com).

## Cómo clonar y abrir en VS Code

1. Instalar lo necesario si no lo tenés:
   - [Git](https://git-scm.com/downloads)
   - [.NET 10 SDK](https://dotnet.microsoft.com/download)
   - [Node.js](https://nodejs.org/) (18 o superior)
   - [VS Code](https://code.visualstudio.com/)

2. Clonar el repositorio (necesitás acceso como colaborador, porque el repo es privado):

   ```bash
   git clone https://github.com/Lattanxz/futbol-amigos.git
   ```

3. Abrirlo en VS Code:

   ```bash
   cd futbol-amigos
   code .
   ```

   O desde VS Code: `Archivo > Abrir carpeta...` y elegir la carpeta `futbol-amigos`.

## Cómo correrlo localmente

Necesitás dos terminales abiertas en paralelo (una para el backend, otra para el frontend).

**Backend** (API en `http://localhost:5033`):

```bash
cd backend
dotnet run --urls http://localhost:5033
```

La base de datos es un proyecto de PostgreSQL en Neon (compartido por todo el grupo, no local). Antes de correr el backend por primera vez hay que configurar dos secretos (una sola vez, quedan guardados en tu máquina, nunca se suben al repo):

```bash
cd backend
dotnet user-secrets set "ConnectionStrings:Default" "<connection-string-de-neon>"
dotnet user-secrets set "Jwt:Key" "<una-clave-larga-y-secreta>"
```

El connection string de Neon lo sacás desde [console.neon.tech](https://console.neon.tech) → tu proyecto → botón "Connect" (formato `postgresql://usuario:password@host/basededatos?sslmode=require`). Pedíselo a quien creó el proyecto en Neon si no tenés acceso. Al arrancar, el backend aplica solo las migraciones pendientes contra esa base.

**Frontend** (en `http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

Con ambos corriendo, entrás a `http://localhost:5173`, te registrás con tu nombre/email/contraseña y ya podés empezar a cargar jugadores y partidos.

## Deploy

- **API**: https://futbol-amigos-api.onrender.com (Render, plan free — el servicio se duerme a los 15 min sin uso, la primera request después de eso tarda ~30-50s en responder mientras arranca de nuevo).
- **App**: https://frontend-xi-drab-4s5d2dfmtd.vercel.app (Vercel).

Ambos quedaron conectados al repo de GitHub: cada push a `master` dispara un redeploy automático de los dos.

Variables de entorno configuradas en el dashboard de cada plataforma (no están en el repo):

- Render (`futbol-amigos-api` → Environment): `ConnectionStrings__Default` (connection string de Neon), `Jwt__Key`, `Frontend__Url` (la URL de Vercel, para habilitar CORS).
- Vercel (`frontend` → Settings → Environment Variables): `VITE_API_URL` (la URL de Render + `/api`).

El build de Render usa `backend/Dockerfile` (definido en `render.yaml`); el de Vercel es el build estándar de Vite (`frontend/vercel.json` agrega el rewrite necesario para que las rutas de React Router funcionen).

## Estado del proyecto

Primera iteración (MVP). Quedan como posibles mejoras futuras: torneos/campeonatos, estadísticas avanzadas, login social, notificaciones, seguimiento de partido en vivo y subida de fotos de perfil.
