const winston = require('winston');
const path = require('path');
const moment = require('moment');
const helper = require('./../helper');

var logger = caller => {
    return winston.createLogger({
        level: 'info',
        //format: winston.format.json(),
        format: winston.format.combine(
            winston.format.label({ label: path.basename(caller) }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format(function dynamicContent(info, opts) {
                info.message = '' +  helper.isArray(info.message) || helper.isObject(info.message) ? helper.formatJSONWrap(info.message) : info.message;
                return info;
            })(),
            winston.format.simple()
        ),
        transports: [
            /**
             * Define output as file
             */
            // new winston.transports.File({
            //     level: 'info',
            //     filename: __dirname + '/../log/app.log',
            //     format: winston.format.printf(info => `${new Date().toISOString()} | ${info.label} | ${info.level} | ${info.message}`),
            //     handleExceptions: true,
            //     maxsize: 5242880, // 5MB
            //     maxFiles: 5,
            //     colorize: false,
            // }),
            
            new (winston.transports.Console)({
                json: true,
                //format: winston.format.printf(info => `${new Date().toISOString()} | ${info.label} | ${info.level} | ${info.message}`),
                format: winston.format.printf(info => `${moment().format('YYYY-MM-DD HH:mm:ss')} | ${info.label} | ${info.level} | ${info.message}`),
                colorize: true
            })
        ]
    });
}

module.exports = logger;