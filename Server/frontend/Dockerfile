# Use an official Node.js runtime as a parent image
FROM node:19-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install && npm install pm2 -g

# Copy the rest of the app's code to the container
COPY . .

# Build the app
RUN npm run build