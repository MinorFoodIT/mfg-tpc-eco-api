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
            pool.getConnection()
            .then( (client) => {
                return client.query('SELECT code,storeCode from Lotto where code=$1 and typeCode=$2 ',[lotto.code,lotto.typeCode])
                        .then( res => {
                            resolve(res.rows)
                            client.release();
                        })
                        .catch(err => {
                            resolve({})
                            client.release();
                            console.log(err)
                        })
                    
            })
            .catch(e =>{
                reject(null)
                console.log(e)
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