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
        let findinglotto = await dbservice.getLottoByCode(lotto)
        if(helper.isNullEmptry(findinglotto)) {
            let newLotto =  await dbservice.saveLotto(lotto)
            if(newLotto){
                res.json(
                    new APIResponse(
                        "Success", 
                        200, 
                        newLotto, 
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
            let findinglotto = await dbservice.getLottoByCode(lotto)
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

module.exports = router;