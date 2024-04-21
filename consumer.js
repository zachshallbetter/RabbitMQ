#!/usr/bin/env node
import amqp from 'amqplib';
import winston from 'winston';

const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'amqp://guest:guest@localhost';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function receive() {
  const conn = await amqp.connect(RABBITMQ_SERVER);
  const ch = await conn.createChannel();
  const q = 'testQueue';

  await ch.assertQueue(q, { durable: true });
  logger.info(` [*] Waiting for messages in %s. To exit press CTRL+C`, q);
  ch.consume(q, (msg) => {
    if (msg.content) {
      try {
        const messageData = JSON.parse(msg.content.toString());
        logger.info(` [x] Received: ${JSON.stringify(messageData)}`);
        ch.ack(msg);
      } catch (e) {
        logger.error(`Failed to parse message content: ${e}`);
        ch.nack(msg, false, false);
      }
    }
  }, { noAck: false });
}

receive().catch(error => logger.error(`Failed to receive messages: ${error}`));


// Example usage:
// node consumer.js

