# 1. Start with a official light Node runtime as the base template
FROM node:20-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package description files first (enables cached package layers)
COPY package*.json ./

# 4. Install production dependencies
RUN npm ci --only=production

# 5. Copy the Prisma schema folder to generate the client mapping
COPY prisma ./prisma/

# 6. Generate the Prisma database client library mapping
RUN npx prisma generate

# 7. Copy the rest of the backend source code
COPY . .

# 8. Document that the container listens on port 5001 at runtime
EXPOSE 5001

# 9. Set the default command to start the Express server
CMD ["node", "server.js"]
