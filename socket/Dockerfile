FROM node:16.13

WORKDIR /socket

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000