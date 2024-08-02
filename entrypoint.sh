#!/bin/sh

until pg_isready -h db -p 5432 -U admin; do
  echo "Waiting for PostgreSQL to start..."
  sleep 2
done

npx prisma migrate dev --name init

nodemon server.js
