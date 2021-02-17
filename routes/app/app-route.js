var express = require("express")
var logger = require("./../../common/logging/winston")(__filename)
var router = express.Router()
const fs = require('fs')

const Lotto = require('../../database/model/foodmarketing').Lotto;
const dbservice = require('./../../database/dbClient');  //require('./../../database/services/dbservice');
const helper = require('./../../common/helper')
const asyncMiddleware = require('../../utils/asyncMiddleWare')
const APIResponse = require("./../../common/APIResponse")
const APIError = require("./../../common/APIError")
const moment = require('moment')

const responseError = (res, message ,status, isPublic) => {
    res.status(status).json(new APIError(message, status, isPublic).jsonReturn());
}

router.post("/v1/lotto", asyncMiddleware(async (req, res, next) => {
    logger.info("[LOTTO] POST /v1/lotto")
    let client_id = req.headers["client_id"]
    if(!helper.isNullEmptry(client_id) && client_id === 'minorfoodit'){
        logger.info("[LOTTO] code "+ req.body.code )
        logger.info("[LOTTO] store "+ req.body.storeCode )
        let lotto = new Lotto() 
        lotto.brand = req.body.brand
        lotto.promotion = req.body.promotion
        lotto.typeCode = new String(req.body.typeCode).toUpperCase()
        lotto.code = req.body.code
        lotto.telephone = req.body.telephone
        lotto.firstName = req.body.firstName
        lotto.lastName = req.body.lastName
        lotto.storeCode = req.body.storeCode
        lotto.posDate = req.body.posDate
        lotto.posData = JSON.stringify(req.body)
        lotto.requestID = req.body.requestID
        lotto.posFlag = 'posSaved';
        let findinglotto = await dbservice.getLottoByCodeAndTypeCode(lotto)
        if(helper.isNullEmptry(findinglotto)) {
            let newLotto =  await dbservice.saveLotto(lotto)
            if(newLotto){
                res.status(200).json(
                    new APIResponse(
                        "Success", 
                        200, 
                        {id : newLotto.insertId}, 
                        true
                ).jsonReturn())
            }else{
                //Did not success
                responseError(res, "Code is error", 500, true)
            } 
        }else{
            responseError(res, "Code is duplicated", 500, true)
        }
    }else{
        //Authen is invalid
        responseError(res, "Client_id is invalid", 403, true)
    }

}))

router.get("/v1/lotto/:typecode/:code", asyncMiddleware(async (req, res, next) => {
    logger.info("[LOTTO] GET /v1/lotto")
    try{
        let client_id = req.headers["client_id"]
        if(!helper.isNullEmptry(client_id) && client_id === 'minorfoodit'){
            let typecode = req.params.typecode;
            let code = req.params.code;
            let lotto = new Lotto() 
            lotto.code = code
            lotto.typeCode = typecode
            let findinglotto = await dbservice.getLottoByCodeAndTypeCode(lotto)
            if (findinglotto) {
                res.json(
                    new APIResponse(
                        "Success", 
                        200, 
                        findinglotto, 
                        true 
                ).jsonReturn())
            } else {
                error(res, "Code did not found", 404, true)
            }
        }else{
            //Authen is invalid
            responseError(res, "Client_id is invalid", 403, true)
        }
    }catch(err){
        console.log(err)
    }
}))

router.post("/v1/lotto/webregister", asyncMiddleware(async (req, res, next) => {
    logger.info("[LOTTO] POST /v1/lotto/webregister")
    let client_id = req.headers["client_id"]
    if(!helper.isNullEmptry(client_id) && client_id === 'minorfoodit'){
        logger.info("[LOTTO] code "+ req.body.code )
        logger.info("[LOTTO] firstName "+ req.body.firstName )
        logger.info("[LOTTO] telephone "+ req.body.telephone )
        logger.info("[LOTTO] email "+ req.body.email )
        let lotto = new Lotto() 
        //lotto.brand = req.body.brand
        //lotto.promotion = req.body.promotion
        //lotto.typeCode = new String(req.body.typeCode).toUpperCase()
        lotto.code = req.body.code
        lotto.telephoneByWeb = req.body.telephone
        lotto.firstNameByWeb = req.body.firstname
        lotto.lastNameByWeb  = req.body.lastname
        lotto.citizenByWeb   = req.body.citizen
        lotto.emailByWeb     = req.body.email
        lotto.termOfConditionFlag  = req.body.termOfConditionFlag
        lotto.dataAcceptedFlag     = req.body.dataAcceptedFlag
        // let timezone = await dbservice.getSystemTimezone()
        // console.log(JSON.stringify(timezone))
            
        let results = await dbservice.getLottoByCode(lotto)
        if(!helper.isNullEmptry(results)) {
            logger.info('[Results] dbservice.getLottoByCode :')
            console.log(JSON.stringify(results))
            if(Array.isArray(results) && results.length > 0){
                //Exist then save updated from web
                let record = results[0]
                if( record.posDate !== moment().format('YYYY-MM-DD') ){
                    logger.info('[MOMENT] current :' +moment().format('YYYY-MM-DD HH:mm:ss'))
                    logger.info('[Results] posDate :')
                    console.log(record.posDate +' != '+ moment().format('YYYY-MM-DD') )
                    responseError(res, "Code is invalid of date", 404, true)
                }else if( record.posFlag === 'posSaved' && record.lottoFlag === 'Registered'){
                    responseError(res, "Code was registered", 404, true)
                }else if( record.posFlag === 'posSaved' && record.lottoFlag !== 'Registered'){
                    lotto.updatedDate = moment().format('YYYY-MM-DD HH:mm:ss')
                    let newLotto =  await dbservice.updateLottoByWeb(lotto)
                    res.status(200).json(
                        new APIResponse(
                            "Success", 
                            200, 
                            helper.isNullEmptry(newLotto)?0:newLotto.changedRows, 
                            true 
                    ).jsonReturn())
                }else{
                    responseError(res, "Code is error", 500, true)
                }

            }else{
                responseError(res, "Code is invalid", 404, true)
            }
        }else{
            responseError(res, "Code is error", 500, true)
        }
    }else{
        //Authen is invalid
        responseError(res, "Client_id is invalid", 403, true)
    }

}))

module.exports = router;