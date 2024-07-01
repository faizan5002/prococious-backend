const winston = require('winston');
const moment = require('moment');

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => moment().utcOffset(5).format("YYYY-MM-DD HH:mm:ss"),
  }),
  winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
);

const options = {
  file: {
    level: 'info',
    filename: './logs/app.log',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    format: logFormat,
  }
};

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  format: logFormat,
  transports: [
    new winston.transports.File(options.file)    
  ],
  exitOnError: false
});

module.exports = logger;
