const moment = require('moment');
const helper = require('./../../common/helper');

class Lotto {
    constructor(id, brand, promotion, typeCode, code, telephone, firstName, lastName, storeCode, posDate, posData, requestID, firstNameByWeb, lastNameByWeb,
        citizenByWeb ,telephoneByWeb, emailByWeb, termOfConditionFlag, dataAcceptedFlag, posFlag, lottoFlag, reportFlag, createdDate, updatedDate) {
        this.id = id;
        this.brand = brand;
        this.promotion = promotion;
        this.typeCode = typeCode;
        this.code = code;
        this.telephone = telephone;
        this.firstName = firstName;
        this.lastName = lastName;
        this.storeCode = storeCode;
        this.posDate = posDate;
        this.posData = posData;
        this.requestID = requestID;
        this.firstNameByWeb = firstNameByWeb;
        this.lastNameByWeb = lastNameByWeb;
        this.citizenByWeb = citizenByWeb;
        this.telephoneByWeb = telephoneByWeb;
        this.termOfConditionFlag = termOfConditionFlag;
        this.dataAcceptedFlag = dataAcceptedFlag;
        this.emailByWeb = emailByWeb;
        this.posFlag = posFlag;
        this.lottoFlag = lottoFlag;
        this.reportFlag = reportFlag;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
    }
}

module.exports = {
    Lotto: Lotto
}