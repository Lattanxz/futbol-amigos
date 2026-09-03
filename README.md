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

- **Backend**: ASP.NET Core (.NET 10) + Entity Framework Core + SQLite, autenticación JWT.
- **Frontend**: React + Vite + TypeScript + Tailwind CSS.

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

La primera vez que corre crea sola la base de datos SQLite (`backend/futbolamigos.db`) con las migraciones de Entity Framework. También necesita una clave para firmar los tokens de login, que se configura una sola vez con:

```bash
cd backend
dotnet user-secrets set "Jwt:Key" "<una-clave-larga-y-secreta>"
```

**Frontend** (en `http://localhost:5173`):

```bash
cd frontend
npm install
npm run dev
```

Con ambos corriendo, entrás a `http://localhost:5173`, te registrás con tu nombre/email/contraseña y ya podés empezar a cargar jugadores y partidos.

## Estado del proyecto

Primera iteración (MVP). Quedan como posibles mejoras futuras: torneos/campeonatos, estadísticas avanzadas, login social, notificaciones, seguimiento de partido en vivo y subida de fotos de perfil.
