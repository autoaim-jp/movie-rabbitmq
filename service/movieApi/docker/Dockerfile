FROM node:20-slim

WORKDIR /app

COPY ./service/movieApi/src/package.json /app/

RUN yarn install

COPY ./service/movieApi/src /app

