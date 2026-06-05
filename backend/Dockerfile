FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 4000
CMD ["npm", "start"]
