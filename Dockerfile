# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# 1. Instalar dependências para aproveitar o cache
FROM base AS install
RUN mkdir -p /temp/dev
COPY top-sharing/package.json top-sharing/bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# 2. Copiar as dependências instaladas e o resto do código para o builder
FROM base AS builder
COPY --from=install /temp/dev/node_modules ./node_modules
COPY top-sharing/ .
RUN bun run build

# 3. Imagem final de produção
FROM base AS release
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json

USER bun
EXPOSE 3000/tcp
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT [ "bun", "run", "start" ]
