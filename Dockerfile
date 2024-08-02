FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y postgresql-client

COPY package*.json ./
COPY prisma ./prisma

RUN npm install && npm -g install nodemon && npx prisma generate

COPY . .
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["/app/entrypoint.sh"]

