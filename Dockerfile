# Use official Apify Node.js base image
FROM apify/actor-node:18

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --include=optional --no-audit --no-fund

# Copy source code
COPY . ./

# Run the actor
CMD npm start
