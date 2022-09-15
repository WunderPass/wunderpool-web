FROM node:16.13

RUN addgroup moritz && adduser --system --group moritz moritz
RUN mkdir /web && chown moritz:moritz /web
USER web

WORKDIR /web
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD [“npm”, “start”]

# WORKDIR /web

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000