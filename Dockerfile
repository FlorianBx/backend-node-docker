FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
COPY . .

RUN npm install && npm -g install nodemon && npx prisma generate --schema /app/src/prisma/schema.prisma

COPY . .

EXPOSE 3000
CMD ["nodemon", "server.js"]

