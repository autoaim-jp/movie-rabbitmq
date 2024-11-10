FROM node:20-slim

WORKDIR /app

RUN apt install imagemagick ffmpeg

COPY ./service/movieEngine/src/package.json /app/

RUN yarn install

COPY ./service/movieEngine/src /app

