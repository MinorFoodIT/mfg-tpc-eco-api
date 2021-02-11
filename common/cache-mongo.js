const os = require('os');
const logger = require('./logging/winston')(__filename)
const mongoose = require('mongoose');
const MongoMemoryServer = require('mongodb-memory-server');
const moment = require('moment');
const dateNow = moment().format('YYYY-MM-DD');
const agenda = require('./agendaDB');

//logger.info('[Deploy] build '+moment().format('YYYY-MM-DD HH:mm:ss'));
/**
 * In memory database
 */

/*
const mongod = new MongoMemoryServer.MongoMemoryServer({
    instance: {
        port: 10050, // by default choose any free port
        ip: '127.0.0.1', // by default '127.0.0.1', for binding to all IP addresses set it to `::,0.0.0.0`,
        dbName: 'IMDB', // by default generate random dbName
        dbPath: 'temp', // by default create in temp directory
        //storageEngine: 'ephemeralForTest', // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
        //debug: false, // by default false
        //replSet: string, // by default no replica set, replica set name
        //auth: false, // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
        //args: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
    }

    binary: {
        version: 'lastest', // by default 'latest'
        downloadDir: 'node_modules/.cache/mongodb-memory-server/mongodb-binaries', // by default node_modules/.cache/mongodb-memory-server/mongodb-binaries
        platform: os.platform(), // by default os.platform()
        arch: os.arch(), // by default os.arch()
        debug: false, // by default false
        checkMD5: false, // by default false OR process.env.MONGOMS_MD5_CHECK
        systemBinary: 'process.env.MONGOMS_SYSTEM_BINARY', // by default undefined or process.env.MONGOMS_SYSTEM_BINARY
    },

    debug: false, // by default false
    autoStart: true, // by default true

});
*/
/*
{
    instance: {
        port: 10050,
        ip: '127.0.0.1',
        dbName: 'IMDB',
        dbPath: 'temp',
        storageEngine: `devnull`, // by default `ephemeralForTest`, available engines: [ 'devnull', 'ephemeralForTest', 'mmapv1', 'wiredTiger' ]
        debug: false, // by default false
        //replSet: 'no', // by default no replica set, replica set name
        auth: false // by default `mongod` is started with '--noauth', start `mongod` with '--auth'
        //args: string[], // by default no additional arguments, any additional command line arguments for `mongod` `mongod` (ex. ['--notablescan'])
    },
    debug: true,
    autoStart: true

}
*/
mongoose.Promise = Promise;
const mongod = new MongoMemoryServer.MongoMemoryServer();

const mongooseOpts = { // options for mongoose 4.11.3 and above
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    useNewUrlParser: true,
};

mongod.getConnectionString().then((mongoUri) => {
    mongoose.connect(mongoUri, mongooseOpts).catch(mongoErr => {
        logger.info('[Mongod] Error');
        logger.info(mongoErr);
    });
    mongoose.connection.on('error', () => {
        throw new Error(`Mongoose: unable to connect to database: ${mongoUri}`);
    });
    mongoose.connection.on('connected', () => {
        logger.info('[Mongoose] '+'cached connection created')
        //JOB
        agenda.SdmOrders(mongoUri);
    });
    mongoose.connection.on('disconnected', () => {
        logger.info('[Mongoose] '+'connection disconnected')
    });

})

exports.stop = function() {
    // you may stop mongod manually
    mongod.stop();
    return 'Mongoose: mongod cache stoped';
}


