FROM node:16.13

WORKDIR /web

COPY package*.json ./

RUN apt-get -y update && apt-get -y install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

RUN npm install

COPY . .

EXPOSE 3000