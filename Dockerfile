FROM node:14
WORKDIR /blinq
COPY package.json /blinq
COPY package-lock.json ./
RUN npm install
COPY . /blinq
CMD node main.js