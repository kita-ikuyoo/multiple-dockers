FROM node:16-alpine


WORKDIR /usr/app

RUN apk add --no-cache curl

COPY package.json .

RUN npm install

COPY . .



ENTRYPOINT [ "npm","run","start" ]