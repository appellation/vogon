FROM node:10-alpine

WORKDIR /usr/src/gateway
COPY package.json yarn.lock ./
RUN yarn install

COPY . .
CMD ["npm", "start"]
