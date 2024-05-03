FROM docker.io/node:lts-alpine as preamble
    ARG port=3333

    # Set environment variables
    ENV CONFIG_DIRECTORY /ephemera/dist/api
    ENV PORT ${port}

    EXPOSE ${PORT}

FROM preamble as install
    WORKDIR /ephemera

    # Copy files necessary for npm install
    COPY package.json package-lock.json ./

    # Install dependencies (WORKDIR must be set or node cries)
    RUN npm install --include dev

    # Afterward, copy ALL files
    COPY . .

FROM install as development
    # Build
    ENV NODE_ENV development
    RUN ["npx", "nx", "run", "api:build:development"]

FROM install as local
    # Build
    ENV NODE_ENV local
    RUN ["npx", "nx", "run", "api:build:development"]

FROM install as production
    # Build
    ENV NODE_ENV production
    RUN ["npx", "nx", "run", "api:build:production"]
