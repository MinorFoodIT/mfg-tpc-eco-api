const {EntitySchema} = require('typeorm');
const Lotto = require('./../model/foodmarketing').Lotto;

module.exports = new EntitySchema({
    name: "Lotto",
    target: Lotto,
    columns: {
        id: {
            primary: true,
            type: "bigint",
            generated: true
        },
        brand: {
            type: "varchar",
            nullable: true
        },
        promotion: {
            type: "varchar"
        },
        typeCode: {
            type: "varchar",
            nullable: true
        },
        code: {
            type: "varchar",
            nullable: true
        },
        telephone: {
            type: "varchar",
            nullable: true
        },
        firstName: {
            type: "varchar",
            nullable: true
        },
        lastName: {
            type: "varchar",
            nullable: true
        },
        storeCode: {
            type: "varchar",
            nullable: true
        },
        posDate: {
            type: "timestamp",
            nullable: true
        },
        posData: {
            type: "longtext",
            nullable: true
        },
        requestID: {
            type: "varchar",
            nullable: true
        },
        firstNameByWeb: {
            type: "varchar",
            nullable: true
        },
        lastNameByWeb: {
            type: "varchar",
            nullable: true
        },
        telephoneByWeb: {
            type: "varchar",
            nullable: true
        },
        posFlag: {
            type: "varchar",
            nullable: true
        },
        lottoFlag: {
            type: "varchar",
            nullable: true
        },
        reportFlag: {
            type: "varchar",
            nullable: true
        },
        createdDate: {
            type: "timestamp",
            nullable: true
        },
        updatedDate: {
            type: "timestamp",
            nullable: true
        }
    },
    indices: [
    ]
}); 
