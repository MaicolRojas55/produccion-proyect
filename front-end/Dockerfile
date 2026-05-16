FROM node:20-alpine

WORKDIR /app

# Valor por defecto para el proxy de Vite dentro de la red Docker (Compose puede sobrescribir).
ENV API_PROXY_TARGET=http://gateway:80

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# --port debe coincidir con EXPOSE y con docker-compose "5173:5173".
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]
