FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN rm -f package-lock.json && npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
