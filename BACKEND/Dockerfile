FROM node:20-slim

# Install Java JDK, G++, Python, and python-is-python3 (so 'python' works)
RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    g++ \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install npm dependencies (production mode)
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server script
CMD ["npm", "start"]
