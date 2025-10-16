FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (necesitamos ts-node para el seed)
RUN npm ci

# Copiar archivos de configuración
COPY tsconfig.json ./

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["npm", "start"]
