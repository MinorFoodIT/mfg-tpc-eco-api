const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const methodOverride = require('method-override');
// Process Env
var config = require('./common/config'); 

// Logging & datetime
const expressWinston = require('express-winston');
const winstonInstance = require('winston');

// Swagger
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./common/swagger.json');
const swStats = require('swagger-stats');
const moment = require('moment');

// API JSON RESPONSE 
const APIError = require('./common/APIError');
const APIResponse = require('./common/APIResponse');

// Make bluebird default Promise
Promise = require('bluebird');

var app = express();
app.use(swStats.getMiddleware({swaggerSpec:swaggerDocument}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());  // secure apps by setting various HTTP headers
app.use(helmet());          // enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
  //To do...
}
app.use(express.static(path.join(__dirname, 'public'))); //put favicon.ico on public
app.disable('etag'); //Cache and 304 not modified ,http header with same request

/** GET /health-check - Check service health */
app.get('/health-check', (req, res) => {
    res.json({
        status: httpStatus[200],
        time: moment().format('YYYY-MM-DD HH:mm:ss')
       });
  }
);

// Router 
var apiRoutes = require('./routes/app/app-route');
app.use('/api', apiRoutes);


// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
    if (err instanceof expressValidation.ValidationError) {
        // validation error contains errors which is an array of error each containing message[]
        const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
        const error = new APIError(unifiedErrorMessage, err.status, true);
        return next(error);
    }
    return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API_NOT_FOUND', httpStatus.NOT_FOUND ,true);
    return next(err);
});

/**
 * log error in winston transports except when executing test suite
 */
if (config.env !== 'test'){
    app.use(expressWinston.errorLogger({
        transports: [
            new (winstonInstance.transports.Console)({
                json: true,
                colorize: true,
                format: winstonInstance.format.printf(info => `${moment().format('YYYY-MM-DD HH:mm:ss')} | ${info.label} | ${info.level} | ${info.message}`)
            })
        ],
        format: winstonInstance.format.combine(
            winstonInstance.format(function dynamicContent(info, opts) {
                info.message = '' + info.message;
                return info;
            })(),
            winstonInstance.format.simple()
        ),
        meta: true, // optional: log meta data about request (defaults to true)
        msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
        colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    }));

}

/**
 * error handler, send stacktrace only during development
 */
app.use((err, req, res, next) => {// eslint-disable-line no-unused-vars
    console.log(err);
    if(err){
        if(err.status){
            res.status(err.status).json({
                code: err.status,
                message: err.isPublic ? err.message : httpStatus[err.status],
                //stack: config.env === 'development' ? err.stack : {}
                stack: (config.env === 'development' || config.env === 'production') ? err.message : {}
            })
        }else{
            res.status(500).json({
                code: 500,
                message: err.message  ,
                stack: (config.env === 'development' || config.env === 'production') ? err.message : {} //err.stack
            })
        }
    }
});

module.exports = app;