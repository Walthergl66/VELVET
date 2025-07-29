# Etapa base
FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Etapa de instalación de dependencias
FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "No lockfile found." && exit 1; \
  fi

# Etapa de build de la app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Etapa de desarrollo
FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]

# Etapa final (producción)
FROM base AS runner
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["npm", "start"]

