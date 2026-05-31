# Etapa 1: dependencias Node
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Etapa 2: entorno de desarrollo (hot reload)
FROM node:20-alpine
WORKDIR /app

ENV API_PROXY_TARGET=http://gateway:80

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]
