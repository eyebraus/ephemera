FROM docker.io/node:lts-alpine

# Arrange arguments
ARG environment=local
ARG port=3333
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

ENTRYPOINT [ "/bin/sh", "-c" ]
