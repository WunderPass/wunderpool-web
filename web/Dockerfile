FROM node:16.13

WORKDIR /web

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000