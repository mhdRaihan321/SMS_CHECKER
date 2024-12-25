
FROM node:20

WORKDIR /app

COPY package.json*.json ./

RUN npm install

COPY . .

EXPOSE 2000

CMD [ "node", "index.js" ]