FROM node:8.8.1 AS builder
MAINTAINER olizilla <oli@tableflip.io>

WORKDIR /src

ENV METEOR_ALLOW_SUPERUSER=true
RUN curl -sL https://install.meteor.com | sed s/--progress-bar/-sL/g | /bin/sh

COPY package.json /src
RUN npm install --production --quiet && npm install --only=dev --quiet

COPY . /src
RUN npm run build \
    && meteor build --directory .. \
    && cd /bundle/programs/server \
    && npm install --production --quiet

# ---- Container to run the app ------------------------------------------------
FROM node:8.8.1-slim

# Add Tini a lightweight init system that properly handles running as PID 1.
# A Node.js process running as PID 1 will not respond to SIGTERM (CTRL-C) and similar signals.
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#handling-kernel-signals
ADD https://github.com/krallin/tini/releases/download/v0.14.0/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

USER node
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
WORKDIR /opt/bundle
COPY --from=builder /bundle /opt/bundle
CMD ["node", "main.js"]
