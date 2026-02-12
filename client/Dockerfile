FROM node:16-alpine AS builder

WORKDIR /usr/app

RUN apk add --no-cache curl

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

# FROM nginx

EXPOSE 3000

RUN npm install -g serve

ENTRYPOINT [ "serve", "-s" ,"build" ]


# COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# COPY --from=builder /usr/app/build /usr/share/nginx/html