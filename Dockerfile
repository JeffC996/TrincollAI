# 1. base
FROM node:20.11.0

# 2. add some opeartions based on base
WORKDIR /app

COPY package.json ./ 
COPY app.js ./

RUN npm install

EXPOSE 2001
CMD ["npm", "start"]