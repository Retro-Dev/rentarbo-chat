"use strict";
const express    = require('express');
const app        = express();
const http       = require('http').createServer(app);
const io         = require('socket.io')(http);
const bodyParser = require('body-parser');
const helper = require('./app/helpers/Helper');
var path         = require('path');

const dotenv = require('dotenv');
dotenv.config();

var cors = require('cors');
 
// use it before all route definitions
//app.use(cors({origin: process.env.PHP_BASE_URL}));
app.use(cors({origin: "*"}));

var port = process.env.PORT;
// global variable
global.__basedir = __dirname;
global.__base_url = process.env.BASE_URL + ':' + process.env.PORT;
global.__php_base_url = process.env.PHP_BASE_URL;
global.__user_image_url = process.env.USER_BASE_URL;
global.__paginition_limit = 20;
global.__app_timezone = process.env.TIME_ZONE;
global.__image_url=process.env.PHP_BASE_USER;

// parse requests of content-type - application/json
app.use(bodyParser.json());

// load asset
app.use(express.static(path.join(__dirname, 'public')));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


//include route file
require('./routes/route.js')(app);
const dbConfig   = require('./config/database.js');
helper.makeNewDir("public/uploads");


http.listen(port, () => {
    console.log('listening on *:' + port);
});

//socket io
require('./socket/socket.js')(io);
