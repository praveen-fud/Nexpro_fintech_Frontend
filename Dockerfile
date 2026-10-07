# Production image (Railway). For local development use `npm run dev` instead.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values at BUILD time, so Railway must hand them in as
# build args. Set these as service variables in Railway.
ARG VITE_API_URL
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist

# Railway injects PORT; -s serves index.html for client-side routes.
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
