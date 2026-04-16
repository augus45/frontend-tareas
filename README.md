# Frontend - Gestor de Tareas

Interfaz web construida con React y Vite que consume la API de tareas.

## Tecnologías
- React
- Vite
- JavaScript
- CSS (con estilos personalizados y variables para modo oscuro)

## Funcionalidades
- **Autenticación**: Registro de nuevos usuarios y login seguro con JWT.
- **Gestión de Tareas**: Crear, listar, editar y eliminar tareas.
- **Propiedades de Tareas**: Cada tarea incluye título, descripción, y un nivel de prioridad (Baja, Media, Alta).
- **Filtros**: Filtrar tareas por estado (Todas, Pendientes, Completadas).
- **Personalización**: Alternancia entre modo claro y modo oscuro (Dark mode).

## Cómo correrlo en local
1. Instalar dependencias:
```bash
npm install
```
2. Ejecutar servidor de desarrollo:
```bash
npm run dev
```

> **Nota**: Asegúrate de tener la API de tareas corriendo al mismo tiempo para que la aplicación funcione correctamente, o tenerla apuntando a tu URL en producción (Railway, por ejemplo).
