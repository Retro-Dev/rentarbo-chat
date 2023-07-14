"use strict";
const dotenv = require('dotenv');
dotenv.config();
const slugify = require('slugify')
var fs = require('fs');
var crypto = require('crypto');
var moment = require('moment-timezone');

class Helper {

    /**
     *
     * @param url
     * @returns {Promise<void>}
     */
    async urlGenerate(url) {
        return await slugify(url, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            remove: undefined, // remove characters that match regex, defaults to `undefined`
            lower: true,      // convert to lower case, defaults to `false`
            strict: false,     // strip special characters except replacement, defaults to `false`
        })
    }

    async makeNewDir(dir_name) {
        var dir = dir_name.split("/");
        var new_dir = [];
        if (dir.length > 0) {
            for (var dir_index = 0; dir_index < dir.length; dir_index++) {
                new_dir.push(dir[dir_index])
                fs.access(new_dir.join("/"), function(error) {
                    if (error) {
                        fs.mkdir(new_dir.join("/"), "0777",function () {
                            //callback(null, file.fieldname + '-' + Date.now(Date.now())+path.extname(file.originalname));
                        });
                    }
                });
            }
        }
    }

    createApiToken(user_id,ip_address,device_type,device_token,datetime)
    {
        datetime = moment(datetime).format('YYYY-MM-DD HH:mm:ss');
        var hmac = crypto.createHmac('sha256', process.env.SECRET_KEY);
        hmac.update(user_id + '|' + ip_address + '|' + device_type + '|' + device_token + '|' + datetime);
        return hmac.digest('hex');
    }
}

module.exports = new Helper()
