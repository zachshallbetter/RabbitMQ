# Use an updated official Node runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json to workdir
COPY package*.json ./

# Install any dependencies including devDependencies for nodemon
RUN npm install --include=dev

# Copy the rest of your application's code
COPY . .

# Make port 5672 (RabbitMQ) and 15672 (RabbitMQ management) available to the world outside this container
EXPOSE 5672 15672

# Define environment variable for RabbitMQ default user and pass
ENV RABBITMQ_DEFAULT_USER=guest
ENV RABBITMQ_DEFAULT_PASS=guest

# Run your application using nodemon when the container launches
CMD ["npm", "run", "dev"]
