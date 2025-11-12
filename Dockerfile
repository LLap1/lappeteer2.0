# Define args with default values, this can be changed by --build-arg BASE_IMG="blabla"
ARG BASE_IMG=node:alpine3

FROM ${BASE_IMG} AS builder
ARG SERVICE
ARG NPM_REGISTRY=https://registry.npmjs.org/
ENV SERVICE=$SERVICE

WORKDIR /app

RUN npm config set registry ${NPM_REGISTRY} && npm config set strict-ssl false
RUN npm install -g pnpm
RUN pnpm config set registry ${NPM_REGISTRY} && npm config set strict-ssl false
RUN pnpm install turbo@2.5.4

COPY . .

RUN pnpm i --filter @auto-doucment/${SERVICE}...
RUN pnpm run build --filter @auto-doucment/${SERVICE}...

CMD cd /app/apps/${SERVICE} && npm run start:prod