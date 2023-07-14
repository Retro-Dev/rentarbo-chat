const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const upload = require("../../app/middleware/upload");
const path = require("path");
const helper = require("../../app/helpers/Helper");
const multipleUpload = async (req, res) => {
    var message = `Files has been uploaded.`;
    try {
        await upload(req, res);
        if (req.files.length <= 0) {
            return res.send(`You must select at least 1 file.`);
        }

        var directory = `public/uploads/${req.body.directory}`

        if (req.files.length > 0) {
            req.files.forEach((file, index) => {
                ffmpeg(file.path)
                    .setFfmpegPath(ffmpeg_static)
                    .screenshots({
                        timestamps: [0.0],
                        filename: file.originalname.split(".")[0] + '.png',
                        folder: `${directory}/thumb`
                    }).on('end', function () {

                });
            })

            message = `Files has been uploaded with thumbnail.`;
        }
        return res.send(message);
    } catch (error) {

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.send("Too many files to upload.");
        }
        return res.send(`Error when trying upload many files: ${error}`);
    }
};

module.exports = {
    multipleUpload: multipleUpload
};
