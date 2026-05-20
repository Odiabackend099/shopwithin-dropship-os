FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/core/package.json packages/core/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/admin/package.json apps/admin/package.json
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
COPY . .
RUN pnpm --filter @dropship-os/core build
RUN pnpm --filter @dropship-os/api prisma:generate
RUN pnpm --filter @dropship-os/api build

FROM base AS api
ENV NODE_ENV=production
COPY --from=build /app /app
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
