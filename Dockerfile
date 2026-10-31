FROM node:20

RUN apt-get update && \
    apt-get install -y ffmpeg imagemagick webp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install && npm install -g pm2 qrcode-terminal

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
