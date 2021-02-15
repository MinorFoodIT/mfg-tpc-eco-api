var pool = require('./mysql-client');
var logger = require('./../common/logging/winston')(__filename);
var helper = require('./../common/helper');

// const saveLottoByCode = (lotto) => {
//     pool.getConnection()
//     .then(client => {
//         return client.query('INSERT INTO raw_requests (raw_request,json_request) ' +
//                             ' values( $1 ,$2)', [req,jsonReq])
//             .then(res => {
//                 client.release();
//             })
//             .catch(e => {
//                 client.release();
//                 logger.info('[saveRawRequest] error => '+ e.stack);
//             })
//     })
//     .catch(err => {
//         logger.info('[Pool connect] error => '+ err.stack);
//     })

// }

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

const getLottoByCode = async(lotto) => {

    return new Promise ((resolve, reject) => {
        try{
            let params = [lotto.code,lotto.typeCode] 
            console.log(params)
            pool(async (err, client) => {
                let sql_query = 'SELECT code,storeCode from lotto where code=? and typeCode=? '
                let results = await queryFunc(err,client,sql_query,params)
                resolve(results)
                // if(err){
                //     console.log(err)
                //     try{
                //         client.release();
                //         reject(null)
                //     }catch(e){
                //         reject(null)
                //     }
                // }else{
                //     client.query('SELECT code,storeCode from lotto where code=? and typeCode=? ',params, function (error, results, fields){
                //         if(error){
                //             console.log(error)
                //             resolve({})
                //             client.release();
                //         }else{
                //             resolve(results)
                //             client.release();
                //         }

                //     })
                // }

            })
         }
        catch(err){
            reject(null)   
            console.log(err)
        }
    })
}

module.exports = {
    getLottoByCode
}