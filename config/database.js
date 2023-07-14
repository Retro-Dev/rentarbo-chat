"use strict";

const dotenv = require('dotenv');
dotenv.config({path:'../.env'});

module.exports = {

    driver: process.env.DB_NODE_CONNECTION,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

}
