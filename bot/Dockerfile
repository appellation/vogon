FROM node:10-alpine

WORKDIR /usr/src/bot
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
CMD ["npm", "start"]
