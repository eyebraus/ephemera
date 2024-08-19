# ================
# preamble
# ================
FROM docker.io/node:lts-alpine AS preamble
ARG continueOnLintFailure=true
ARG continueOnTestFailure=false
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
RUN <<EOF
npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t lint
if [ "$continueOnLintFailure" = "true" ]; then
    exit 0
fi
EOF

# ================
# test
# ================
FROM lint AS test
RUN <<EOF
npx nx run-many --parallel=8 --projects=api,data,model,provide,services,stdlib -t test
if [ "$continueOnTestFailure" = "true" ]; then
    exit 0
fi
EOF

# ================
# build-development
# ================
FROM test AS build-development
ENV NODE_ENV development
RUN npx nx run api:build:development

# ================
# build-local
# ================
FROM test AS build-local
ENV NODE_ENV local
RUN npx nx run api:build:development

# ================
# build-production
# ================
FROM test AS build-production
ENV NODE_ENV production
RUN npx nx run api:build:production
