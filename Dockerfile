FROM node:16-alpine
RUN apk add --no-cache libevent libevent-dev chromium
WORKDIR '/app'
COPY package*.json ./
#RUN apk add --update g++ make python3 py3-pip 
#RUN apk update
#RUN apk upgrade
ENV TZ=Asia/Bangkok
#RUN apk --update add tzdata
#RUN rm -rf /var/cache/apk/*
#RUN apk add --update imagemagick
RUN npm install
COPY . .
CMD ["node","index.js"]