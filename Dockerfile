FROM node:19.8

WORKDIR /usr/src/babilonia

COPY . .

RUN npm i
RUN npm run build

WORKDIR /usr/src/babilonia/dist

CMD [ "node", "index.cjs" ]
