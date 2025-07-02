FROM node:20-alpine as build

RUN apk update && apk upgrade && \
  apk add --no-cache bash git openssh yarn

RUN mkdir /app

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .

ENV REACT_APP_DOCKER true

RUN yarn run build-all

# ---------------

FROM node:20-alpine

RUN mkdir -p /app/build

RUN apk update && apk upgrade && apk add yarn && rm -rf /var/cache/apk/*

WORKDIR /app

RUN yarn add express cors dotenv dotenv-expand axios express-jwt@^8.4.1 axios@^1.6.7

COPY --from=build /app/package.json .
COPY --from=build /app/build ./build
COPY --from=build /app/build-server ./build-server

EXPOSE 8080

ENV NODE_ENV production

CMD ["yarn", "run", "server"]
