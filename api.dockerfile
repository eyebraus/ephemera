ARG environment=development
ARG port=3333

FROM docker.io/node:lts-alpine as preamble
    # Set environment variables
    ENV NODE_ENV ${environment}
    ENV PORT ${port}

    EXPOSE ${PORT}

FROM preamble as config
    WORKDIR /

    # Copy relevant config files
    COPY api/config.yaml api/config.${environment}.yaml ./

FROM preamble as install
    WORKDIR /usr/src

    # Copy files necessary for npm install
    COPY package.json package-lock.json ./

    # Install dependencies (WORKDIR must be set or node cries)
    RUN npm install --include dev

FROM install as build
    WORKDIR /usr/src

    # Copy ALL files
    COPY . .

    # Build API
    RUN ["./node_modules/nx/bin/nx.js", "run", "api:build:${environment}"]
