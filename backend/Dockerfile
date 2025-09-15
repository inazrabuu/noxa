# ------------------- Base builder -------------------- 
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

COPY backend/package.json backend/
COPY frontend/package.json frontend/

RUN npm ci

COPY . .
RUN npm run build -w backend

# ----------------- Production Runtime -----------------
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/backend/dist dist
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json .

ARG PORT=3001
ENV PORT=${PORT}

EXPOSE ${PORT}
CMD ["node", "dist/main.js"]