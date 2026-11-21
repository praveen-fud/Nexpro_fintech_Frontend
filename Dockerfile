# Production image (Railway). For local development use `npm run dev` instead.
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values at BUILD time, so Railway must hand them in as
# build args — a service variable alone never reaches the build. Every
# VITE_* the app reads needs an ARG here or it silently falls back to its
# default, which is how canonical tags end up pointing at the wrong domain.
ARG VITE_API_URL
ARG VITE_SITE_URL
ARG VITE_DEMO_MODE=false
ENV VITE_API_URL=$VITE_API_URL \
    VITE_SITE_URL=$VITE_SITE_URL \
    VITE_DEMO_MODE=$VITE_DEMO_MODE
RUN npm run build

FROM nginx:1.27-alpine
# nginx:alpine runs envsubst over /etc/nginx/templates/*.template at startup,
# which is how Railway's injected $PORT reaches the listen directive.
ENV PORT=3000
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
