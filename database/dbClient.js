var pool = require('./mysql-client');
var logger = require('./../common/logging/winston')(__filename);
var helper = require('./../common/helper');

const queryFunc =  (err,client,query,params) => {
    return new Promise ((resolve, reject) => {
        if(err){
            logger.info('[POOL] connection error : ')
            console.log(err)
            try{
                client.release();
                resolve(null)
            }catch(e){
                reject(null)
            }
        }else{
            try{
                client.query(query ,params, function (error, results, fields){
                    client.release();
                    if(error){
                        logger.info('[POOL] query error : ')
                        console.log(error)
                        resolve(null)
                    }else{
                        resolve(results)
                    }
                })
            }catch(tryErr){
                logger.info('[POOL] try catch query error : ')
                console.log(tryErr)
                reject(null)
            }
        }

    })
}

/*
* RESULTS
****************
"fieldCount": 0,
"affectedRows": 1,
"insertId": 2,
"serverStatus": 2,
"warningCount": 0,
"message": "",
"protocol41": true,
"changedRows": 0
*/
const saveLotto = async(lotto) => {
    return new Promise ((resolve, reject) => {
        try{
            pool(async (err, client) => {
                let params = [lotto.brand,lotto.promotion,lotto.typeCode
                    ,lotto.code,lotto.telephone,lotto.firstName,lotto.lastName
                    ,lotto.storeCode,lotto.posDate,lotto.posData,lotto.requestID,lotto.posFlag] 
                let sql_query = 'INSERT INTO lotto(brand,promotion,typeCode,code,telephone,firstName,lastName,storeCode,posDate,posData,requestID,posFlag) values(?,?,?,?,?,?,?,?,?,?,?,?) '
                logger.info('[SQL] '+sql_query)
                console.log(params)
                let results = await queryFunc(err,client,sql_query,params)
                resolve(results)
            })
         }
        catch(err){
            reject(null)   
            console.log(err)
        }


    });
}

const getLottoByCode = async(lotto) => {

    return new Promise ((resolve, reject) => {
        try{
            let params = [lotto.code,lotto.typeCode] 
            pool(async (err, client) => {
                let sql_query = 'SELECT code,storeCode from lotto where code=? and typeCode=? '
                logger.info('[SQL] '+sql_query)
                console.log(params)
                let results = await queryFunc(err,client,sql_query,params)
                resolve(results)
            })
         }
        catch(err){
            reject(null)   
            console.log(err)
        }
    })
}

module.exports = {
    getLottoByCode,
    saveLotto
}