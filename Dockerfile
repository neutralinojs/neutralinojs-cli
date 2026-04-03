# syntax=docker/dockerfile:1

ARG NODE_VERSION=18.20.8

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project source
COPY . .

# Run CLI by default
CMD ["sh"]