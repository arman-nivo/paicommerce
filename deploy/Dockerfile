# Multi-app Dockerfile. Build one app per image:
#   docker build -f deploy/Dockerfile --build-arg APP=storefront -t paicommerce-storefront .
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY . .
RUN pnpm install --frozen-lockfile

FROM deps AS build
ARG APP
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @pai/${APP} build

FROM base AS run
ARG APP
ENV NODE_ENV=production APP=${APP}
COPY --from=build /repo /repo
WORKDIR /repo/apps/${APP}
EXPOSE 3000
CMD ["sh", "-c", "pnpm next start --port 3000"]
