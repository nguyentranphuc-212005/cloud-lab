FROM node:22
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY server/ ./server/
COPY server/server.js ./server.js
COPY server/models/ ./models/

EXPOSE 5000
CMD ["npm", "start"]
