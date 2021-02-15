const Joi = require('joi');

// require and configure dotenv, will load vars in .env to in PROCESS.ENV
require('dotenv').config({silent: true});

// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(['development', 'production', 'test', 'provision'])
        .default('development'),
    PORT: Joi.number()
        .default(4000),
    JWT_SECRET: Joi.string().required()
        .description('JWT Secret required to sign')
}).unknown()
    .required();

//Validate
const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    jwtSecret: envVars.JWT_SECRET,
    mysql_host: envVars.mysql_host,
    mysql_port: envVars.mysql_port,
    mysql_user: envVars.mysql_user,
    mysql_password: envVars.mysql_password,
    mysql_database: envVars.mysql_database,

}
console.log('[ENVIRONMENT] '+config.env);
module.exports = config;