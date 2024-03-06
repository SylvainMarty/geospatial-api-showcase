FROM node:20.11.1-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=development
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock
RUN apk add --no-cache build-base make python3 # Needed for simdjson
RUN npm install -g yarn @nestjs/cli --force && yarn
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["sh", "startService.sh", "start"]
