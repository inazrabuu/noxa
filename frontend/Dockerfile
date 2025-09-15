FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN npm ci

COPY . .
RUN npm run build -w frontend

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["npm", "start"]
