FROM node:20-slim

# Debian-based — no Alpine OpenSSL GCM cipher issues
# Install OpenSSL + deps needed by Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund --include=dev &&     npm install -g tsx

COPY . .
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
