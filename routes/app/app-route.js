var express = require("express")
var logger = require("./../../common/logging/winston")(__filename)
var router = express.Router()
const fs = require('fs')
const XLSX = require("xlsx");

const Lotto = require('../../database/model/foodmarketing').Lotto;
const dbservice = require('./../../database/dbClient');  //require('./../../database/services/dbservice');
const helper = require('./../../common/helper')
const asyncMiddleware = require('../../utils/asyncMiddleWare')
const APIResponse = require("./../../common/APIResponse")
const APIError = require("./../../common/APIError")
const moment = require('moment')
const nodemailer = require('nodemailer');

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
                    //responseError(res, "Code is invalid of date", 404, true)
                    res.status(200).json(
                        new APIResponse(
                            "Code is invalid of date", 
                            404, 
                            {}, 
                            true 
                    ).jsonReturn())
                }else if( record.posFlag === 'posSaved' && record.lottoFlag === 'Registered'){
                    //responseError(res, "Code was registered", 404, true)
                    res.status(200).json(
                        new APIResponse(
                            "Code was registered", 
                            404, 
                            {}, 
                            true 
                    ).jsonReturn())
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
                    //responseError(res, "Code is error", 500, true)
                    res.status(200).json(
                        new APIResponse(
                            "Code is error", 
                            500, 
                            {}, 
                            true 
                    ).jsonReturn())
                }

            }else{
                //responseError(res, "Code is invalid", 404, true)
                res.status(200).json(
                    new APIResponse(
                        "Code is invalid", 
                        404, 
                        {}, 
                        true 
                ).jsonReturn())
            }
        }else{
            //responseError(res, "Code is error", 500, true)
            res.status(200).json(
                new APIResponse(
                    "Code is invalid", 
                    404, 
                    {}, 
                    true 
            ).jsonReturn())
        }
    }else{
        //Authen is invalid
        responseError(res, "Client_id is invalid", 403, true)
    }

}))

router.post('/v1/report/lotto' ,async(req, res) => {
    logger.info("[REPORT] POST /v1/report/lotto")
    try {
        let body = req.body;
        let duration = body.duration
        logger.info("[REPORT] "+duration)

        let concept = await dbservice.getBrandMail(body.site_group);
        let mails = String(concept.mail).split(";");

        let fileName = duration+'_'+'lucky_draw'+'_'+ moment().add(-24, 'hours').format('YYYY_MM_DD') +'.xlsx';
        let path = process.cwd() + "/public/uploads/" + fileName;
        console.log('[REPORT] file to create '+ path);

        let rowData = await dbservice.getReportLotto(duration);
        // rowData.map(row=>{
        //     row.order_time =  helper.isNullEmptry(row.order_time)?"":moment.tz(row.order_time, 'Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
        //     return row;  
        //   })
        logger.info('[REPORT] data tranform size = '+rowData.length);

        let workbook = XLSX.utils.book_new();
        let worksheet = XLSX.utils.json_to_sheet(rowData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DataExport');
        let attachedData = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', bookSST: false });

        //XLSX.writeFile(wb, path);  // `${__dirname}/upload-folder/dramaticpenguin.MOV`; //res.download(path); // Set disposition and send it.
        console.log('[REPORT] buffer created ');
        // config สำหรับของ gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'minorfoodit@gmail.com', // your email
            pass: 'hhjewtsulknpxvrh' // your email password
            }
        });

        let p_regards = '<p>Please do not reply back this mail. If you have any concern please contact Minor Food IT - Brand Partner.</p>' +
        '<p>Thanks and Regards,</p>' +
        '<p>Grab API Administrator&nbsp;&nbsp;</p><p>&nbsp;</p>';

        let mailOptions = {
            from: 'minorfoodit@gmail.com',        // sender
            to: mails, //'akarat_su@minor.com',   // list of receivers
            cc: ['akarat_su@minor.com'],
            subject: '[LuckyDraw] Registerd data to export of '+ moment().add(-24, 'hours').format('YYYY_MM_DD') +' ',              // Mail subject
            attachments: [ { //file on disk as an attachment
                filename: fileName,
                content: attachedData //path // stream this file
            }],
            html: p_regards   //HTML body
        };
        
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              console.log(info);
         });

        res.status(200).json({
            message: "Data to export is done",
          });

    }catch (error) {
        console.log(error);
        res.status(500).send({
          message: "Could not send report",
        });
      }
})

module.exports = router;