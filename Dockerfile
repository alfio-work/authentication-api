FROM node:20.18.0 as base
WORKDIR /usr/local/node/api
ENV PORT=20000
COPY package.json .
RUN npm install
COPY . .
EXPOSE $PORT

FROM base as local
RUN npm install nodemon -g
CMD ["npm", "run", "local"]

FROM base as build
RUN npm install pm2 -g
CMD ["pm2-runtime", "ecosystem.config.js"]
