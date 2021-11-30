FROM node:16
WORKDIR /blinq
COPY package.json /blinq
COPY package-lock.json ./
RUN npm install -g npm
RUN npm install
COPY . /blinq
CMD node main.js