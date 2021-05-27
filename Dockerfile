ARG PORT=4000
FROM node:14-alpine AS node

FROM node AS builder
WORKDIR /app
COPY package.json ./
RUN yarn install

RUN --mount=type=secret,id=AWS_ACCESS_KEY_ID \
    cat /run/secrets/AWS_ACCESS_KEY_ID

COPY . .
RUN yarn build

FROM node AS final
ENV NODE_ENV production
RUN apk --no-cache -U upgrade
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN yarn global add pm2
COPY package.json process.yml ./
USER node
RUN yarn install --production
COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE 4000
ENTRYPOINT ["pm2-runtime", "./process.yml"]
