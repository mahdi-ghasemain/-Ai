FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG EXPO_PUBLIC_DEMO_AUTH=true
ENV EXPO_PUBLIC_DEMO_AUTH=$EXPO_PUBLIC_DEMO_AUTH
ENV EXPO_PUBLIC_API_URL=/api
ENV EXPO_NO_DOTENV=1
RUN npx expo export --platform web

FROM nginx:1.28-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
