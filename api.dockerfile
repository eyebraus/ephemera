ARG environment=development
ARG port=3333

FROM docker.io/node:lts-alpine as preamble
    # Set environment variables
    ENV NODE_ENV ${environment}
    ENV PORT ${port}

    EXPOSE ${PORT}
    WORKDIR /usr/src

FROM preamble as install
    # Copy files necessary for npm install
    COPY package.json package-lock.json ./

    # Install dependencies (WORKDIR must be set or node cries)
    RUN npm install --include dev

FROM install as build
    # Copy ALL files
    COPY . .

    # Build API
    RUN ["./node_modules/nx/bin/nx.js", "run", "api:build:${environment}"]
