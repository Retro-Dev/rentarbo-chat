const util = require("util");
const path = require("path");
const multer = require("multer");
var fs = require('fs');
const helper = require("../helpers/Helper");

var storage =  multer.diskStorage({
    destination: function (req, file, callback) {
        var directory = `public/uploads/${req.body.directory}`
        callback(null, directory);
    },
    filename: function (req, file, callback) {
        var directory = `public/uploads/${req.body.directory}`
        const match = ["image/png", "image/jpeg", "video/mp4"];

        if (match.indexOf(file.mimetype) === -1) {
            var message = `${file.originalname} is invalid. Only accept png/jpeg.`;
            return callback(message, null);
        }
        fs.access(directory, function(error) {
            if (error) {
                fs.mkdir(`public/uploads/message-upload`, "0777",function () {
                    helper.makeNewDir( `${directory}/thumb`);
                    callback(null, file.fieldname + '-' + Date.now(Date.now())+path.extname(file.originalname));
                });
            } else {
                helper.makeNewDir( `${directory}/thumb`);
                callback(null, file.fieldname + '-' + Date.now(Date.now())+path.extname(file.originalname));
            }
        });
    }
});

var uploadFiles = multer({ storage: storage }).any("myFile", 10);
var uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
