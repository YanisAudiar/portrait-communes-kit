FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG VITE_USE_SAMPLE_TERRITORY=true
ENV VITE_USE_SAMPLE_TERRITORY=$VITE_USE_SAMPLE_TERRITORY

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
