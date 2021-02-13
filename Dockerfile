FROM node:10-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

# Arguments
ARG DB_HOST
ENV DB_HOST=${DB_HOST}
RUN echo ${DB_HOST}

USER root
COPY package.json ./

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers make python && \
  npm install --quiet node-gyp -g &&\
  npm install --quiet && \
  apk del native-deps

RUN npm install

#check file .dockerignore
#COPY --chown=node:node ./bin /home/node/app
#COPY --chown=node:node ./common /home/node/app
#COPY --chown=node:node ./controllers /home/node/app
#COPY --chown=node:node ./model /home/node/app
#COPY --chown=node:node ./services /home/node/app
#COPY --chown=node:node ./.env /home/node/app
#COPY --chown=node:node ./app.js /home/node/app
#COPY --chown=node:node ./package-lock.json /home/node/app
#COPY --chown=node:node ./README.md /home/node/app
#COPY --chown=node:node ./README.md /home/node/app
COPY --chown=node:node . .
RUN pwd

EXPOSE 4000

CMD [ "npm","run","start" ]