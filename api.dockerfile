FROM docker.io/node:lts-alpine

ARG buildTarget=development
ARG environment=local
ARG outDir=/out
ARG port=3333
ARG workspaceDir=/workspace
ENV CONFIG_DIRECTORY ${workspaceDir}/dist/api
ENV NODE_ENV ${environment}
ENV OUT_DIRECTORY ${outDir}
ENV PORT ${port}
EXPOSE ${PORT}
WORKDIR ${workspaceDir}

COPY . .
RUN chmod a+x ./build.sh ./run.sh
RUN ./build.sh api --build=${buildTarget} --install=run

ENTRYPOINT [ "/bin/sh", "-c" ]
CMD [ "./run.sh api -o" ]
