# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy from build stage
COPY --from=build /app /app

# Expose the application port
EXPOSE 3000

# Set the command to start the server
CMD ["node", "server.js"]
