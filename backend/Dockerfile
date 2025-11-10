# Stage 1: Build
FROM node:20-alpine AS builder


WORKDIR /app


# Copy package files first for better caching
COPY package*.json ./


# Install dependencies
RUN npm ci


# Copy source code
COPY . .


# Build TypeScript (adjust if your build script or output folder differs)
RUN npm run build


# Stage 2: Production
FROM node:20-alpine


WORKDIR /app


# Copy package files and install only production deps
COPY package*.json ./
RUN npm ci --only=production


# Copy built files from builder stage
COPY --from=builder /app/dist ./dist


# Expose the port your app listens on (default from onboarding: 3000)
EXPOSE 3000


# Set production env
ENV NODE_ENV=production


# Start the app (adjust entrypoint if different)
CMD ["node", "dist/index.js"]