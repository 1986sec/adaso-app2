FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install build tools for native modules (e.g., bcrypt)
RUN apk add --no-cache python3 make g++

# Install dependencies (fallback to install if ci fails in certain npm versions)
RUN npm config set fund false \
 && npm config set audit false \
 && npm install --omit=dev --no-audit --no-fund

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 7000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
