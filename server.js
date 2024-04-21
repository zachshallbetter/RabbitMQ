import express from 'express';
import path from 'path';
import morgan from 'morgan';
import fs from 'fs';
import { fork } from 'child_process';
import winston from 'winston';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class ServerController {
    constructor() {
      this.app = express();
      this.serverLogStream = fs.createWriteStream(path.join(__dirname, 'server.log'), { flags: 'a' });
      this.RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'amqp://guest:guest@localhost';
      this.EXCHANGE_NAME = process.env.EXCHANGE_NAME || 'logs';
      this.EXCHANGE_TYPE = 'direct';
      this.DURABLE = true;
      this.configureApp();
      this.logger = this.configureLogger();
      this.startWorker();
      this.app.listen(process.env.PORT || 8000, () => {
        this.logServerStatus(`Server started on port ${process.env.PORT || 8000}`, 'info');
      });
    }
  
    configureApp() {
      // Use morgan middleware for logging HTTP requests in 'dev' format and log to a file
      this.app.use(morgan('dev', { stream: this.serverLogStream }));
  
      // Serve static files from the public directory
      this.app.use(express.static('public'));
    }
  
    configureLogger() {
      const customLevels = {
        levels: {
          error: 0,
          warn: 1,
          info: 2,
          http: 3,
          verbose: 4,
          debug: 5,
          silly: 6
        },
        colors: {
          error: 'red',
          warn: 'yellow',
          info: 'green',
          http: 'magenta',
          verbose: 'cyan',
          debug: 'blue',
          silly: 'grey'
        }
      };
  
      winston.addColors(customLevels.colors);
  
      return winston.createLogger({
        levels: customLevels.levels,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
        transports: [
          new winston.transports.File({ filename: path.join(__dirname, 'server.log'), level: 'info', handleExceptions: true, handleRejections: true }),
          new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.simple()
            )
          })
        ],
        exceptionHandlers: [
          new winston.transports.File({ filename: path.join(__dirname, 'exceptions.log') })
        ],
        rejectionHandlers: [
          new winston.transports.File({ filename: path.join(__dirname, 'rejections.log') })
        ]
      });
    }
  
    logServerStatus(message, type = 'info') {
      this.logger.log(type, message);
    }

    startWorker() {
      const worker = fork('./worker.js', [], {
        env: { ...process.env, RABBITMQ_SERVER: this.RABBITMQ_SERVER, EXCHANGE_NAME: this.EXCHANGE_NAME, EXCHANGE_TYPE: this.EXCHANGE_TYPE, DURABLE: this.DURABLE.toString() },
      });

      worker.on('message', (msg) => {
        const { severity, text } = JSON.parse(msg);
        this.logServerStatus(`Worker: ${text}`, severity);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          this.logServerStatus(`Worker exited with code ${code}, restarting...`, 'error');
          setTimeout(this.startWorker.bind(this), 1000); // Restart worker with a delay to prevent rapid restart loops
        }
      });

      worker.on('error', (err) => {
        this.logServerStatus(`Worker error: ${err.message}, restarting...`, 'error');
        setTimeout(this.startWorker.bind(this), 1000); // Restart worker with a delay to handle unexpected errors gracefully
      });
    }
}

const serverController = new ServerController();
