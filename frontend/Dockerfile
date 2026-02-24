# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the Next.js application
RUN npm run build

# Production Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Use the non-root user 'node' provided by the alpine image
# Ensure the node user has access to the app directory
RUN chown -R node:node /app

# Copy necessary files from builder
COPY --from=builder --chown=node:node /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Switch to non-root user
USER node

# Expose port 3000
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]
