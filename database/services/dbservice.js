const helper = require('./../../common/helper');
const moment = require('moment');
const {getConnection ,getRepository,IsNull,Not,Between,getManager } = require('typeorm');
const { addDays, subDays } = require('date-fns');

const logger = require('../../common/logging/winston')(__filename);
const Lotto = require('../model/foodmarketing').Lotto;


/**
 * Lotto 
 */
const getLottoByCode = async(lotto) => {
    return await getConnection().getRepository(Lotto).findOne({ 
        code: lotto.code,  
        typeCode: lotto.typeCode
    })
}
const saveLotto = async(lotto) => {
    return await getConnection().getRepository(Lotto).save(lotto)
}
const deleteLotto = async(lotto) => {
    let deletinglotto =  await getLottoByCode(lotto)
    return await getConnection().getRepository(Lotto).delete(deletinglotto.id)
}

module.exports = {
    saveLotto,
    getLottoByCode,
    deleteLotto
}
