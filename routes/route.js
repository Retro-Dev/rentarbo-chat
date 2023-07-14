"use strict";
// const RoomController = require('../app/controllers/RoomController');
const UserController = require('../app/controllers/UserController');
const UserControllerload=new UserController;
// const ChatMessageController = require('../controllers/ChatMessageController');
// const uploadController = require("../controllers/UploadController");
// const mutli_file_upload = require('../app/helpers/mutli_file_upload');
var fs = require('fs')
var path = require('path')
var multer  =   require('multer');
var storage =  multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads');
    },
    filename: function (req, file, callback) {
        fs.mkdir('public/uploads', "0777",function () {
            callback(null, file.fieldname + '-' + Date.now(Date.now())+path.extname(file.originalname));
        });
    }
});



module.exports = (app) => {
  
    app.post('/api/file_upload', function (req,res) {
        var upload = multer({ storage : storage}).single('file');
        upload(req,res,function(err) {
            if(err instanceof multer.MulterError) {
                return res.status(400).json({
                    code: 400,
                    message: "Validation Error",
                    data: {
                        message: err
                    },
                    pagination: {
                        links: {
                            first: null,
                            last: null,
                            prev: null,
                            next: null
                        },
                        meta: {
                            current_page: 1,
                            from: 1,
                            last_page: 0,
                            to: 0,
                            total: 3
                        }
                    }
                });
            }
            return res.status(200).json({
                code: 200,
                message: "File has been uploaded successfully",
                data: {
                    file_url: '/uploads/' + req.file.filename
                },
                pagination: {
                    links: {
                        first: null,
                        last: null,
                        prev: null,
                        next: null
                    },
                    meta: {
                        current_page: 1,
                        from: 1,
                        last_page: 0,
                        to: 0,
                        total: 3
                    }
                }
            });
        });
    });
  
   // Create a new Note
    // app.get('/api/room/detail', RoomController.getSingleRecordById);
    // app.post('/api/room/create', RoomController.insertRecord);

 const rew=9;
    // Create a new Note
    // app.get('/api/user', UserController.getRecord);
    app.get('/api/user/detail', UserControllerload.getSingleRecordById);
    app.post('/api/user/create', function (req, res) {
        res.send("About this wiki");
      });
   /* app.post('/api/user/login', UserController.login);
    app.get('/api/user/status', UserController.updateStatus);

    // Create a new Note
    app.get('/api/chat_message', ChatMessageController.getRecord);
    app.get('/api/chat_message/detail', ChatMessageController.getSingleRecordById);
    app.post('/api/chat_message/create', ChatMessageController.insertRecord);


    app.post('/api/file_upload', function (req,res) {

        var upload = multer({ storage : storage}).single('file');
        upload(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.");
            }
            res.end(req.file.path);
        });
    });
*/

   /* app.post('/api/upload-multiple-images', (req, res) => {
        // 10 is the limit I've defined for number of uploaded files at once
        // 'multiple_images' is the name of our file input field
        let upload = multer({ storage: storage, fileFilter: mutli_file_upload.imageFilter }).array('file', 10);

        upload(req, res, function(err) {
            if (req.fileValidationError) {
                return res.send(req.fileValidationError);
            }
            //else if (...) // The same as when uploading single images

            let result = [];
            const files = req.files;
            let index, len;

            // Loop through all the uploaded images and display them on frontend
            for (index = 0, len = files.length; index < len; ++index) {
                result.push({"name" : files[index].path});
            }

            res.send(result);
        });
    });*/

    //app.post("/api/upload-multiple-images", uploadController.multipleUpload);


/*    let routes = app => {
        router.post("/api/upload-multiple-images", uploadController.multipleUpload);
        return app.use("/", router);
    };*/

}
