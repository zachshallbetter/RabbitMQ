To test the logging of message processing completion and access the RabbitMQ dashboard, follow the steps below and update the [README.md](file:///Users/zachshallbetter/Sites/RabbitMQ/README.md#1%2C1-1%2C1) file as needed:

### Prerequisites
Ensure RabbitMQ is operational with the Management Plugin by following these steps. If RabbitMQ is not running, initiate it using Docker with the Management Plugin by executing the commands below:

**Setting Up RabbitMQ with Docker:**

- **Starting a New RabbitMQ Container:** To launch a new RabbitMQ instance with the management plugin and expose necessary ports, use:
  ```bash
  docker-compose up --build
  ```

- **Managing the RabbitMQ Container:** For starting, stopping, and removing the existing RabbitMQ container, the following commands are used respectively:
  ```bash
  docker-compose start
  docker-compose stop
  docker-compose down
  ```

- **Accessing Logs and Shell:** To fetch logs or access the shell for various administrative tasks such as listing queues, bindings, exchanges, and users, utilize:
  ```bash
  docker-compose logs
  docker-compose exec rabbitmq rabbitmqctl list_queues
  docker-compose exec rabbitmq rabbitmqctl list_bindings
  docker-compose exec rabbitmq rabbitmqctl list_exchanges
  docker-compose exec rabbitmq rabbitmqctl list_users
  ```

  Note: The `docker-compose logs` command can also be used to stream live logs from the RabbitMQ container.


### Managing Tasks with RabbitMQ

To efficiently manage and distribute tasks within your RabbitMQ setup, follow these steps in the given order:

1. **Server Setup and Execution:**
   Before sending or consuming tasks, ensure your RabbitMQ server is running. Refer to the prerequisites section to start the RabbitMQ server with the management plugin enabled. This step is crucial for both sending tasks to the queue and consuming them. Update the server start command under "Managing Tasks with RabbitMQ" to reflect the `package.json` scripts:
   ```bash
   npm run dev
   ```
   This command uses `nodemon` for live reloading during development.

2. **Consuming Tasks:**
   Prepare your system to consume tasks by utilizing the `worker.js` script. This script listens for new tasks and processes them as they arrive. To start a worker, execute the following command:

   ```bash
   npm run worker
   ```
   To simulate a distributed task processing system, initiate multiple workers using the enhanced capabilities of the `new_task.js` script. This script now supports dynamic worker and visualizer process initiation based on the configurations defined in `server.js`. Execute the following commands to leverage these new features:

   - To dynamically start the visualizer process, use the enhanced `new_task.js` script with the `--visualizer` flag:
     ```bash
     npm run new-task --visualizer
     ```
   - Similarly, to dynamically start worker processes, use the `--worker` flag with the `new_task.js` script:
     ```bash
     npm run new-task --worker
     ```
3. **Sending Tasks:**
   With the server setup and workers ready to consume tasks, the `new_task.js` script has been enhanced to support dynamic task dispatching with advanced features such as priority, delay, and custom routing for sophisticated task management. Below are examples of how to dispatch tasks leveraging these capabilities:

   ```bash
   npm run new-task -- "Task 1" --priority high --exchange logs --routingKey info
   npm run new-task -- "Task 2" --delay 5000 --exchange application --routingKey warning
   npm run new-task -- "Task 3" --priority low --delay 10000 --exchange logs --routingKey error
   ```
   These commands demonstrate the script's enhanced functionality by enqueuing tasks with specified priorities, delays, and routing through custom exchanges and routing keys. Ensure the `new_task.js` script is properly configured to connect to your RabbitMQ server, declaring the necessary exchanges, queues, and bindings with these parameters in mind.

   The server setup, as configured in `server.js`, supports dynamic exchange and queue creation based on the task's requirements. This allows for more flexible and efficient routing of messages, ensuring that tasks are processed by the appropriate workers based on priority, type, or other criteria.
1. **Dynamic Exchange and Queue Binding:**
   The `new_task.js` script has been updated to support dynamic creation of exchanges and queues based on user input, enabling more flexible message routing based on task type or priority. This enhancement allows for specifying the exchange name and type (e.g., direct, topic, fanout) when dispatching a task. The examples provided demonstrate how to utilize this feature for effective task management.

2. **Custom Routing Keys:**
   Custom routing keys can now be specified during task dispatch, offering precise control over message routing to specific queues. This feature is crucial for directing tasks to the appropriate workers, thereby improving the efficiency and reliability of the task management system.

3. **Message Persistence:**
   To enhance reliability, messages are now marked as persistent by setting the `persistent` option to `true` during publishing, and queues are declared as durable. This ensures that tasks remain in the queue even if the RabbitMQ server restarts, providing a robust solution for task management.

4. **Priority Queue Support:**
   The system now supports priority queues, allowing high-priority tasks to be processed ahead of others. This is achieved by setting the `x-max-priority` argument when declaring a queue and specifying the message priority during task publishing, as illustrated in the provided command examples.

5. **Delayed Message Processing:**
   The capability to delay message delivery has been introduced, accommodating tasks that do not require immediate processing. This feature can be leveraged through the RabbitMQ Delayed Message Plugin or by setting a message expiration time for shorter delays, thus offering greater flexibility in task scheduling.
6. **Enhanced Task Acknowledgment and Failure Recovery:**
   Significant improvements have been made to the `new_task.js` script to enhance task acknowledgment and failure recovery mechanisms. These improvements include the implementation of manual acknowledgments, ensuring tasks are only removed from the queue after successful processing. Additionally, a retry mechanism has been introduced for tasks that encounter processing failures, enhancing the reliability and robustness of task management within your RabbitMQ environment.

These enhancements transform the `new_task.js` script, in collaboration with the server configuration in `server.js`, into a more efficient and reliable tool for task management and distribution, facilitating the execution of more complex and dependable task processing workflows.

4. **Real-Time Queue and Message Flow Monitoring:**
   Access the RabbitMQ Management Interface at `http://localhost:15672` with `guest` as both the username and password for real-time monitoring of queues and task processing. This interface offers detailed insights into queue statuses and message specifics. For a graphical representation of message routing within the system, visit `http://localhost:8801` in your web browser. This URL leads to the Message Flow Visualizer, configured in `index.html`, providing a visual overview of message flow.

5. **Docker and RabbitMQ Setup Instructions:**
   To configure Docker and RabbitMQ for your application, refer to the guidelines provided in the `Dockerfile` and `docker-compose.yml`. Initiate the application container and RabbitMQ by executing:
     ```bash
     docker-compose up --build
     ```
   This process initiates RabbitMQ with the management plugin active and applies the necessary environment settings. It also incorporates the `init.sh` script for pre-launch configuration, enabling required plugins and setting up the server.

6. **Task Management:**
   Ensure the `new_task.js` and `worker.js` scripts are correctly mentioned for sending and consuming tasks. Highlight the use of environment variables for RabbitMQ server configuration as seen in `worker.js` and `visualiser.js`.
