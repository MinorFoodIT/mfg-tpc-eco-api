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

const getLottoByCode = async(lotto) => {

    return new Promise ((resolve, reject) => {
        try{
            let params = [lotto.code,lotto.typeCode] 
            console.log(params)
            pool((err, client) => {
                if(err){
                    console.log(err)
                    try{
                        client.release();
                        reject(null)
                    }catch(e){
                        reject(null)
                    }
                }else{
                    client.query('SELECT code,storeCode from lotto where code=? and typeCode=? ',params, function (error, results, fields){
                        if(error){
                            console.log(error)
                            resolve({})
                            client.release();
                        }else{
                            resolve(results)
                            client.release();
                        }

                    })
                }

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