FROM node:20.18.0-alpine3.20

WORKDIR /home/app/

COPY package*.json ./
RUN npm install -g expo-cli && npm install
COPY . .
EXPOSE 8081

CMD [ "npx","expo","start" ]
