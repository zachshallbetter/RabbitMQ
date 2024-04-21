#!/usr/bin/env node

import amqp from 'amqplib';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import winston from 'winston'; // Utilizing winston for enhanced logging capabilities

// Configure winston logger with default and alternative levels for the rest of the codebase
const defaultLogLevel = process.env.LOG_LEVEL || 'info'; // Default log level from environment or 'info'
const alternativeLogLevel = process.env.ALT_LOG_LEVEL || 'debug'; // Alternative log level from environment or 'debug'

const logger = winston.createLogger({
  level: defaultLogLevel,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .option('exchange', {
    alias: 'e',
    describe: 'The name of the exchange to publish messages to',
    type: 'string',
    default: process.env.EXCHANGE_NAME || 'logs',
    demandOption: true
  })
  .option('severity', {
    alias: 's',
    describe: 'The severity level of the message',
    type: 'string',
    default: process.env.DEFAULT_SEVERITY || 'info',
    choices: ['info', 'warning', 'error', 'debug']
  })
  .option('message', {
    alias: 'm',
    describe: 'The message text to send',
    type: 'string',
    default: 'Hello World!',
    demandOption: true
  })
  .option('delay', {
    alias: 'd',
    describe: 'Delay in milliseconds before sending the message',
    type: 'number',
    default: 0,
    coerce: (value) => Math.max(0, value)
  })
  .option('priority', {
    alias: 'p',
    describe: 'Priority level of the message',
    type: 'string',
    choices: ['low', 'normal', 'high'],
    default: 'normal'
  })
  .option('routingKey', {
    alias: 'r',
    describe: 'Routing key for the message',
    type: 'string',
    default: '',
    coerce: (value) => value || undefined
  })
  .option('persistent', {
    alias: 't',
    describe: 'If the message should be marked as persistent',
    type: 'boolean',
    default: true
  })
  .option('contentType', {
    alias: 'c',
    describe: 'Content type of the message',
    type: 'string',
    default: 'application/json',
    choices: ['application/json', 'text/plain', 'application/xml']
  })
  .help('h')
  .alias('h', 'help')
  .strict()
  .argv;

const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'amqp://guest:guest@localhost';

const publishMessage = async ({ exchange, severity, message, delay, priority, routingKey, persistent, contentType }) => {
  try {
    const connection = await amqp.connect(RABBITMQ_SERVER);
    const channel = await connection.createChannel();
    await channel.assertExchange(exchange, 'direct', { durable: true });
    const msg = JSON.stringify({ text: message, severity: severity, priority: priority, contentType: contentType });

    setTimeout(async () => {
      const publishOptions = {
        persistent: persistent,
        contentType: contentType
      };
      channel.publish(exchange, routingKey || severity, Buffer.from(msg), publishOptions);
      logger.info(`Sent message: ${msg} to exchange: ${exchange} with key: ${routingKey || severity}`);
      await channel.close();
      await connection.close();
      logger.info("RabbitMQ connection closed.");
      process.exit(0);
    }, delay);
  } catch (error) {
    logger.error(`Failed to publish message due to error: ${error}`);
  }
};
publishMessage(argv);