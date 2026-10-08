FROM node:22 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:latest

COPY --from=build /app/dist /usr/share/nginx/html