To test the logging of message processing completion with a link to the RabbitMQ dashboard, you can follow these steps and update the [README.md](file:///Users/zachshallbetter/Sites/RabbitMQ/README.md#1%2C1-1%2C1) file accordingly:

### Prerequisites

- Ensure RabbitMQ is running with the Management Plugin enabled. If not already running, you can start RabbitMQ using Docker with the Management Plugin by executing the following commands:

   **Start a new RabbitMQ container with management plugin, exposing ports for AMQP protocol and management UI:**
   ```bash
   docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
   ```

   **Start the existing RabbitMQ container:**
   ```bash
   docker start rabbitmq
   ```

   **Stop the running RabbitMQ container:**
   ```bash
   docker stop rabbitmq
   ```

   **Remove the RabbitMQ container:**
   ```bash
   docker rm rabbitmq
   ```

   **Fetch logs from the RabbitMQ container:**
   ```bash
   docker logs rabbitmq
   ```

   **Open a shell in the RabbitMQ container to list queues:**
   ```bash
   docker exec -it rabbitmq rabbitmqctl list_queues
   ```

   **Open a shell in the RabbitMQ container to list bindings:**
   ```bash
   docker exec -it rabbitmq rabbitmqctl list_bindings
   ```

   **Open a shell in the RabbitMQ container to list exchanges:**
   ```bash
   docker exec -it rabbitmq rabbitmqctl list_exchanges
   ```

   **Open a shell in the RabbitMQ container to list users:**
   ```bash
   docker exec -it rabbitmq rabbitmqctl list_users
   ```
### Managing Tasks with RabbitMQ

To efficiently manage and distribute tasks within your RabbitMQ setup, follow these steps in the given order:

1. **Setting Up the Server:**
   Before sending or consuming tasks, ensure your RabbitMQ server is running. Refer to the prerequisites section to start the RabbitMQ server with the management plugin enabled. This step is crucial for both sending tasks to the queue and consuming them.

2. **Consuming Tasks:**
   Prepare your system to consume tasks by utilizing the `worker.js` script. This script listens for new tasks and processes them as they arrive. To start a worker, execute the following command:

   ```bash
   node worker.js
   ```
   For a distributed task processing system simulation, initiate multiple workers. Each will independently pick up and process tasks from the queue.

3. **Sending Tasks:**
   After setting up the server and initializing workers to consume tasks, use the `new_task.js` script to enqueue tasks. This script takes a task message as a command-line argument, enabling dynamic task creation. Below are examples of how to dispatch tasks to the queue:

   ```bash
   node new_task.js "Task 1"
   node new_task.js "Task 2"
   node new_task.js "Task 3"
   ```
   These commands will enqueue three distinct tasks, "Task 1", "Task 2", and "Task 3", for processing. Ensure the `new_task.js` script is correctly configured to connect to your RabbitMQ server and that it declares the necessary queue.

4. **Monitoring Queue:**
   To observe the queue and the processing of tasks, access the RabbitMQ Management Interface at `http://localhost:15672`. Use `guest` as both the username and password for default login credentials. This interface allows you to view the queues, their statuses, and the messages they hold.

