FROM node:16-alpine AS builder

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM nginx

EXPOSE 3000

COPY ./nginx/nginx.conf /etc/nginx/

COPY --from=builder /usr/app/build /usr/share/nginx/html