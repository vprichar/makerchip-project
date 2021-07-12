FROM node
WORKDIR /app

COPY package.json ./

RUN npm install --quiet
COPY . .
EXPOSE 3018
CMD [ "node", "app.js" ]
