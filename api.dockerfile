FROM docker.io/node:lts-alpine

# Arrange arguments
ARG continueOnTestFailure=false
ARG environment=local
ARG port=3333
ARG target=development
ARG workspaceDir=/workspace

# Arrange environment variables
ENV CONFIG_DIRECTORY ${workspaceDir}/dist/api
ENV NODE_ENV ${environment}
ENV PORT ${port}

# Expose ports
EXPOSE ${PORT}

# Set working directory
WORKDIR ${workspaceDir}

# Stage npm files and nstall dependencies
COPY package.json package-lock.json ./
RUN npm install --include dev

# Stage all other source
COPY . .

# Run build
RUN npx nx run api:build:${target}

# Run test
RUN <<EOF
npx nx run api:test:${target}

if [ "${continueOnTestFailure}" = "true" ]; then
    exit 0
fi
EOF

ENTRYPOINT [ "/bin/sh", "-c" ]
