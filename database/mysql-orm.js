const {createConnection} = require('typeorm');
const logger = require('./../common/logging/winston')(__filename)
const baseconfig = require('./../common/config')
const moment = require('moment');

const connectionConfig = {
    type: "mysql",
    charset: 'utf8mb4',
    //timezone : '+07:00',
    connectTimeout: 120000,
    host     : baseconfig.mysql_host, //'172.17.0.1',
    port     : baseconfig.mysql_port,
    user     : 'root',//baseconfig.mysql_user,
    password : 'root', //baseconfig.mysql_password,
    database : baseconfig.mysql_database,
    entities: [
        require("./entity/Lotto"),
    ],
    synchronize: false
}
console.log(connectionConfig)
createConnection(connectionConfig)
.then((connection) => {
    console.log(JSON.stringify(connectionConfig))
    console.log('[ORM] entiry mapped');
    connection.entityMetadatas.forEach(entity => {
        console.log('[ORM]'+'TableName = '+ entity.tableName +', name = '+entity.name); 
        //propertiesMap:
    })
})

module.exports = {};