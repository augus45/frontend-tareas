# Etapa 1: Construcción (Build) con Node
FROM node:20-alpine AS build

WORKDIR /app

# Copiar configuración de paquetes e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código y construir para producción
COPY . .
RUN npm run build

# Etapa 2: Servidor (Producción) con Nginx
FROM nginx:alpine

# Copiar la build generada por Vite (en la carpeta dist)
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
