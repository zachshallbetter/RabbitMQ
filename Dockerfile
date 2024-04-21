# Use an updated official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to workdir
COPY package*.json ./

# Install dependencies, excluding devDependencies for production
RUN npm install --only=production

# Copy the rest of your application's code
COPY . .

# Expose port for the application
EXPOSE 8000

# Set environment variables for RabbitMQ default credentials
ENV RABBITMQ_DEFAULT_USER=guest
ENV RABBITMQ_DEFAULT_PASS=guest
ENV RABBITMQ_DEFAULT_VHOST=/
ENV RABBITMQ_HOST_PATH=amqp://guest:guest@rabbitmq:5672/

# Command to run the application
CMD ["npm", "start"]

