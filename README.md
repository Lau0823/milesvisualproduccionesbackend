# Miles Visual - Backend API ⚙️

API robusta y escalable construida con NestJS para la gestión de la plataforma **Miles Visual**. Maneja la autenticación, el portafolio multimedia, la gestión de servicios y el sistema de reservas.

## 🛠️ Tecnologías

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Base de Datos**: PostgreSQL
- **Almacenamiento Multimedia**: [Cloudinary](https://cloudinary.com/)
- **Seguridad**: Passport.js con JWT.
- **Documentación**: Swagger UI.

## 📁 Módulos Principales

- **Auth**: Gestión de usuarios, roles y autenticación (incluye Google OAuth).
- **Servicios**: CRUD de planes de fotografía y lógica de precios.
- **Media-Posts**: Gestión del portafolio (subida de imágenes/videos a Cloudinary).
- **Settings**: Configuración dinámica del sitio (videos de cabecera, textos globales).
- **Reservations**: Sistema de gestión de citas y pagos.
- **Quotes**: Manejo de solicitudes de presupuesto.

## 🧪 Testing

El proyecto cuenta con una suite de pruebas unitarias robusta utilizando **Jest**.

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar tests específicos (ej. MediaPosts)
npx jest src/media-posts/media-posts.service.spec.ts
```

## 🚀 Configuración e Instalación

### Requisitos

- Node.js (v18+)
- PostgreSQL
- Cuenta en Cloudinary

### Variables de Entorno

Configura tu archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=...
DB_NAME=milesvisual

JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Ejecutar en modo desarrollo:
   ```bash
   npm run start:dev
   ```

3. Acceder a la documentación API (Swagger):
   `http://localhost:3002/api` (o el puerto configurado).

## 📄 Licencia

Si Forever - Todos los derechos reservados.
