FROM node:alpine

WORKDIR /app

# Copy dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copying source files
COPY . .

# Building app
RUN yarn build

ENV PORT 8080
EXPOSE 8080

CMD [ "yarn", "start" ]
