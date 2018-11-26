FROM node:10-alpine

WORKDIR /usr/src/data
COPY package.json yarn.lock ./
RUN yarn install

EXPOSE 4000
COPY . .
CMD ["npm", "start"]
