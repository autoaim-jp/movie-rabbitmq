FROM node:20-slim

WORKDIR /app

RUN apt update -y
RUN apt install -y imagemagick ffmpeg sox libsox-fmt-all jq curl bc

COPY ./service/movieEngine/src/package.json /app/

RUN yarn install

COPY ./service/movieEngine/src /app

