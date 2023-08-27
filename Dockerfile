FROM node:18-alpine as builder

WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn install

COPY . /app/
RUN yarn build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/build-server /app/build-server
COPY docker/package.json docker/yarn.lock docker/entrypoint.sh /app/
COPY prisma/ /app/prisma
RUN yarn install
RUN mkdir /data
RUN chmod +x /app/entrypoint.sh
EXPOSE 4000

#CMD ["ls", "-la", "/app"]
ENTRYPOINT [ "/app/entrypoint.sh" ]
