#####################################################
# Base image
#####################################################
FROM node:24-slim AS base

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm


#####################################################
# Dependencies
#####################################################
FROM base AS deps

COPY .npmrc pnpm-lock.yaml package.json /app/
RUN pnpm install --frozen-lockfile


#####################################################
# Build
#####################################################
FROM base AS builder

COPY --from=deps /app/node_modules /app/node_modules
COPY . /app

RUN pnpm exec prisma generate --schema=prisma/schema.prisma
RUN pnpm build


#####################################################
# Production dependencies only
#####################################################
FROM base AS prod-deps

COPY .npmrc pnpm-lock.yaml package.json /app/
RUN pnpm install --frozen-lockfile --prod --ignore-scripts


#####################################################
# Production image
#####################################################
FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system --gid 1001 app \
  && adduser --system --home /home/app --group --uid 1001 app

COPY --chown=app:app --from=prod-deps /app/node_modules ./node_modules
COPY --chown=app:app --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=app:app --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --chown=app:app --from=builder /app/package.json ./package.json
COPY --chown=app:app --from=builder /app/dist ./dist
COPY --chown=app:app --from=builder /app/prisma ./prisma

USER app

CMD ["node", "dist/main.js"]
