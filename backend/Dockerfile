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
RUN npm install --no-audit --no-fund

COPY . .
RUN npx prisma generate

EXPOSE 3000
CMD ["npm", "run", "dev"]
