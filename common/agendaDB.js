const logger = require('./logging/winston')(__filename)
const config = require('./config')
const moment = require('moment');
const Agenda = require('agenda');
const agenda = new Agenda();
//const MongoClient = require('mongodb').MongoClient;

/* DATE-TIMESTAMP
var begin = moment().add(-5,'minutes')
var end = moment().add(5,'minutes')
logger.info(typeof begin)
logger.info(new Date(begin))
logger.info(new Timestamp(new Date(begin),0))
logger.info(new Timestamp((new Date(begin)).getTime()/1000,0))
logger.info(typeof end)
logger.info(new Date(end))
logger.info(new Timestamp(new Date(end),0))
logger.info(new Timestamp((new Date(end)).getTime(),0))
logger.info(new Timestamp((new Date(end)).getTime()/1000,0))
var endtime = (new Date(end)).getTime()
logger.info(new Date(endtime))
*/

/** Example
 * 
 // await agenda.now('startupCheckEvent');
 // await agenda.every('50 minutes', ['clearEvent']);
 // await agenda.every('15 0 30 * *',['cleardb']);
 */

const dbservice = require('./../database/services/dbservice');
const sdkEvent = require("./../events/sdkEvent");
const helper = require('./helper');

function SdmOrders(url){
    agenda.database( url ,'agendaJob')
    //agenda.processEvery('1 minute'); //agenda.maxConcurrency(2); //agenda.defaultConcurrency(2);

    agenda.on('ready', async function() {
        await agenda.start();
    });
}

function viewJob(req, res, next){
    logger.info('To view scedule job running')
        agenda.jobs()
            .then( jobs =>{
                var Jobs = [];
                jobs.map(job => {
                    Jobs.push(job.agenda.attrs)
                })
                res.json(jobs)
            })
            .catch(err => {
                logger.error(err.message)
                next(err)
            })
}

module.exports = {SdmOrders,viewJob}