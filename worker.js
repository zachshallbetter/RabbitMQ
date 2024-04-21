#!/usr/bin/env node

import amqp from 'amqplib';
import winston from 'winston'; // Utilizing winston for enhanced logging

// Utilizing environment variables for flexibility with Docker deployments
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'amqp://guest:guest@localhost';
const PREFETCH_COUNT = parseInt(process.env.PREFETCH_COUNT || '5', 10); // Prefetch count for consumer

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    
    // Setting prefetch count for this channel to control message flow
    await channel.prefetch(PREFETCH_COUNT);

    const exchangeName = process.env.EXCHANGE_NAME || 'logs'; // Utilizing environment variable with a fallback
    const defaultSeverity = process.env.DEFAULT_SEVERITY || 'info'; // Utilizing environment variable with a fallback

    // Ensure the exchange is declared as durable to match the server's configuration
    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const q = await channel.assertQueue('', { exclusive: true });
    logger.info(`Awaiting messages in queue: ${q.queue}. Exit with CTRL+C`);
    channel.bindQueue(q.queue, exchangeName, defaultSeverity);
    
    // Consuming messages from the queue with manual acknowledgments
    channel.consume(q.queue, (msg) => {
      if (msg.content) {
        let messageData;
        try {
          messageData = JSON.parse(msg.content.toString());
          logger.info(`Received: ${JSON.stringify(messageData)}`);
          // Acknowledge the message as processed
          channel.ack(msg);
          // Sending status update back to server.js
          if (process.send) {
            process.send(JSON.stringify({severity: 'info', text: `Received message: ${JSON.stringify(messageData)}`}));
          }
        } catch (e) {
          logger.error(`Failed to parse message content: ${e.message}`);
          // Reject the message without requeuing
          channel.nack(msg, false, false);
          // Sending error status back to server.js
          if (process.send) {
            process.send(JSON.stringify({severity: 'error', text: `Error parsing message content: ${e.message}`}));
          } else {
            channel.nack(msg, false, false);
          }
        }
      }
    });

  } catch (error) {
    logger.error(`Connection or channel creation failed: ${error.message}`, {
      errorStack: error.stack,
      errorName: error.name
    });
    // Sending detailed error status back to server.js
    if (process.send) {
      process.send(JSON.stringify({
        severity: 'error',
        text: `Connection or channel creation error: ${error.message}`,
        errorDetails: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }));
    }
  }
};

connectRabbitMQ();
