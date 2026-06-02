# ==========================================
# STAGE 1: Compile React Static Bundles
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package descriptors and install build dependencies
COPY package*.json ./
RUN npm ci

# Copy client source files
COPY . .

# Build the React production static bundle (creates the 'build' directory)
RUN npm run build

# ==========================================
# STAGE 2: High Performance Nginx Static Server
# ==========================================
FROM nginx:alpine

# Remove default server configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy built React files from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy our custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Document that the web server listens on port 80 at runtime
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
