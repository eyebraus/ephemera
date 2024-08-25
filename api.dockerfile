# ================
# preamble
# ================
FROM docker.io/node:lts-alpine AS preamble
ARG port=3333
ENV CONFIG_DIRECTORY /ephemera/dist/api
ENV PORT ${port}
EXPOSE ${PORT}

# ================
# install
# ================
FROM preamble AS install
WORKDIR /ephemera

# Copy files necessary for npm install
COPY package.json package-lock.json ./

# Install dependencies (WORKDIR must be set or node cries)
RUN npm install --include dev

# Afterward, copy ALL files
COPY . .

# ================
# lint
# ================
FROM install AS lint
RUN npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t lint; exit 0

# ================
# test
# ================
FROM lint AS test
RUN npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t test; exit 0

# ================
# compose
# ================
FROM test AS compose
ENV NODE_ENV local
RUN npx nx run api:build:development
