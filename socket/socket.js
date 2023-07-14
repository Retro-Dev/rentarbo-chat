"use strict";
const CryptoJS = require("crypto-js");
const BaseController = require("../app/controllers/Controller");
const UserClass = require("../app/controllers/UserController");
const User = new UserClass();
const ChatRoomClass = require("../app/controllers/RoomController");
const ChatRoom = new ChatRoomClass();
const ChatMessageClass = require("../app/controllers/ChatMessageController");
const ChatMessage = new ChatMessageClass();
const CallLogClass = require("../app/controllers/CallLogController");
const CallLog = new CallLogClass();
// socket io code
let chat_users = new Map();
let user_active_rooms = new Map();
let user_room_exists = new Map();
var last_active_room = '';
var auth = '';
const users = new Map();
const sockets = new Map();

const UserModalClass = require("../models/User");
const AES_SECRET = CryptoJS.enc.Utf8.parse('6fa979f20126cb08aa645a8f495f6d85');
const AES_VENTOR = CryptoJS.enc.Utf8.parse('I8zyA4lVhMCaJ5Kg');
var current_user_authorization = "";
//socket connection

module.exports = (io) => {

    io.use(async function (socket, next) {
        if (typeof socket.handshake.query.Authorization != "undefined") {
            let authorization = socket.handshake.query.Authorization;
            if (authorization == '') {
                return next(new Error("messages.authorized_header_required"));
            }
            authorization = authorization.replace('Bearer ', '');
            //decrypt AES Data
            try {
                var bytes = CryptoJS.AES.decrypt(authorization, AES_SECRET, { iv: AES_VENTOR });
                var base64Token = bytes.toString(CryptoJS.enc.Utf8);
            console.log(base64Token+"base64Token")

            } catch (err) {
                console.log("ERRR"+err)
                return next(new Error('messages.invalid_authorized_header'));
            }
            //decode base64 token
            authorization = Buffer.from(base64Token, 'base64').toString('ascii')
            current_user_authorization = authorization;
            let user_record = await UserModalClass.getUserByApiToken(authorization);
            if (user_record == 'undefined' || user_record == null) {
                return next(new Error('Authorization token is invalid'));
            }
            if (user_record.status == 0) {
                return next(new Error('Authorization token is invalid'));
            }
            /*            let check_api_token = Helper.createApiToken(user_record.id,clientIp,device_type,device_token,user_record.created_at);
                        if( api_token != check_api_token){
                            return next(new Error('Authorization token is invalid'));
                        }*/
            //join socket to user
            socket.join("user_" + user_record.id)
            await User.updateStatus({ user_id: user_record.id, online_status: 1 });
            // send Notification for this user is online
            chat_users.set(user_record.id, user_record);

            next();
        }
        else {
            next(new Error('Authentication error'));
        }
    })

    io.on('connection', (socket) => {

        console.log('socket connection:', socket.id);
        socket.on("_joinSocketWithCB", async (user_data, callback) => {
            // Join user by id
            console.log("_joinSocketWithCB", user_data)
            socket.join("user_" + user_data.id)
            let response = await User.updateStatus({ user_id: user_data.id, online_status: 1 });
            console.log("response", response)
            // send Notification for this user is online
            user_data.online_status = 1;
            chat_users.set(user_data.id, user_data);
            sockets.set(socket.id, user_data.user_token);
            socket.broadcast.emit("_online", user_data);
            console.log('<----------socket.id---------->', socket.id);
            console.log('<----------socket.rooms---------->', socket.rooms);
            callback(user_data);
            return;
        });




        socket.on("_loadRecentChatCb", async (param, callback) => {
            console.log("_loadRecentChatCb", param)
            let response = await ChatRoom.getOneToOneRecord({ user_id: param.user_id, search: param.search });
            callback(response);
        });


        socket.on("_loadChatHistoryWithCb", async (param, callback) => {
            console.log("_loadChatHistoryWithCb", param)
            if (typeof param.chat_room_id != "undefined" && param.chat_room_id > 0) {
                socket.join("room_" + param.chat_room_id);
            }
            let message = await ChatMessage.getRecord(param);
            callback(message)
        })

        socket.on('_sendMessage', async (client_params) => {
            console.log("_sendMessage", client_params)
            var message = [];
            if (typeof client_params.chat_room_id != "undefined" && client_params.chat_room_id > 0) {
                message = await ChatMessage.insertRecord(client_params)
                io.in('room_' + message.data.chat_room_id).emit("_receivedMessage", message);
                if (typeof message.data.id != "undefined") {
                    client_params.message_id = message.data.id;
                    await ChatMessage.updateMessageCounter(client_params);
                }
            } else {
                message = await ChatMessage.insertRecord(client_params)
                message.data.target_id = client_params.target_id;
                // join room
                socket.join('room_' + message.data.chat_room_id);
                //send message to client
                socket.emit('_receivedMessage', message)
                socket.to("user_" + client_params.target_id).emit('_receivedMessage', message);

                if (typeof message.data.id != "undefined") {
                    client_params.message_id = message.data.id;
                    await ChatMessage.updateMessageCounter(client_params);
                }
            }
        });

        
        socket.on("_getRoomIdWithCb", async (param, callback) => {
            console.log("_getRoomIdWithCb", param)
            let room_id = await ChatMessage.checkExistsRoom(param);

            if (typeof room_id.data.chat_room_id != "undefined" && room_id.data.chat_room_id > 1) {
                // Join room by id
                socket.join("room_" + room_id.data.chat_room_id);
            }
            callback(room_id)
        });

        //Emit typing
        socket.on("_startTyping", (param) => {
            socket.to('room_' + param.id).emit("_startTyping", param);
        });

        //Emit typing
        socket.on("_stopTyping", (param) => {
            socket.to('room_' + param.id).emit("_stopTyping", param);
        });

        //Emit Leave
        socket.on("_leave", (param) => {
            socket.leave("user_" + param.user_id);
            socket.leave("room_" + param.chat_room_id);
        });

        // On logout user
        socket.on("_logoutUser", async (param) => {
            let current_timestamp = new Date();
            let user = await User.updateStatus({ user_id: param.user_id, online_status: 0 });
            socket.broadcast.emit("_offline", chat_users.get(param.user_id));
            socket.leaveAll();
        })

        /**
         * delete Single message
         */
        socket.on('_readRecentChatWithCb', async (param, callback) => {
            let message = await ChatMessage.readRecentChat(param);
            callback(message);
        });


        // Get Group
        socket.on('_getGroupWithCb', async (param, callback) => {
            let groups = await ChatRoom.getRecentGroup(param);
            callback(groups);
        });



        // call initialization    
        socket.on('_init_call', async (params, callback) => {
            // reason
            // caller_id
            // target_id
            console.log("_init_call params ===========>>>>>>>>>> ", params, "socket.rooms", io.sockets.adapter.rooms);
            params.caller = users.get(params.caller_id);
            params.target = users.has(params.target_id) ? users.get(params.target_id) : {};

            // call initialized
            socket.to(`user_${params.target_id}`).emit('_call', {
                code: 200,
                message: "Call initialized successfully",
                data: params
            });

            callback({
                code: 200,
                message: "Calling...",
                data: params
            })
            return
        })

        // call accept
        socket.on('_call_accept', async (params, callback) => {
            // caller_id
            // target_id
            // reason
            // start_time 00:00
            console.log("_call_accept params ===========>>>>>>>>>> ", params);
            await User.UserCallStatus(params.target_id, true)
            let create_call = await CallLog.createLog(params)
            let caller_id = params.caller_id
            params.caller_id = String(caller_id)
            let target_id = params.target_id
            params.target_id = String(target_id)

            let response = { code: 200, message: 'Call Accepted Successfully', data: create_call };
            response.data.caller = users.has(params.caller_id) ? users.get(params.caller_id) : {};;
            response.data.target = users.get(params.target_id);
            socket.to(`user_${params.caller_id}`).emit('_call_accept_sucess', response)

            callback(response)
            return
        })


        // call end
        socket.on('_call_end', async (params, callback) => {
            // caller_id
            // target_id
            // slug
            // duration (in seconds)
            console.log("_call_end params ===========>>>>>>>>>> ", params);
            await User.UserCallStatus(params.target_id, false);
            let log = await CallLog.updateLog(params)
            let updated_minutes = await User.updateCallMinutes(params.caller_id, params.duration)
            let response = { code: 200, message: 'Call Accepted Successfully', data: log };

            params.caller = users.get(params.caller_id);
            params.target = users.has(params.target_id) ? users.get(params.target_id) : {};
            response.data.caller = params.caller
            response.data.target = params.target
            socket.in(`user_${params.caller_id}`).emit('_call_end', response)
            socket.in(`user_${params.target_id}`).emit('_call_end', response)

            callback(response)
            return
        })


        socket.on('_call_reject', async (params, callback) => {
            console.log("_call_reject params ===========>>>>>>>>>> ", params);
            socket.to(`user_${params.caller_id}`).emit('_call_rejected', {
                code: 200,
                message: "Call rejected...",
                data: {}
            })

            callback({
                code: 200,
                message: "Call rejected...",
                data: {}
            })

            return
        })

        socket.on("_disconnect_socket", async (params, callback) => {
            // id
            console.log("_disconnect_socket params ===========>>>>>>>>>> ", params);
            auth = sockets.get(socket.id);
            await UserController.disconnetSocket(auth)
            socket.leave(auth._id);
            console.log('<----------socket.rooms()---------->', socket.rooms);
        });

        socket.on("_reconnect", async (params, callback) => {
            // caller_id
            // target_id
            console.log("_reconnect params ===========>>>>>>>>>> ", params);
            let response = { code: 200, message: 'Call Accepted Successfully', data: {} };
            let caller_id = params.caller_id
            params.caller_id = caller_id
            let target_id = params.target_id
            params.target_id = target_id

            socket.emit('_reconnect', response);
            socket.to(`user_${params.target_id}`).emit('_reconnect', response);
            socket.to(`user_${params.caller_id}`).emit('_reconnect', response);
            callback(response);
            return
        });

        //On Leave the room if the user closes the socket
        socket.on('_disconnect', async (params) => {
            console.log("_disconnect params ===========>>>>>>>>>> ", params);
            socket.leaveAll();
            auth = sockets.get(socket.id);
            // slug
            // end_call_time
            params.user_id = auth.id;
            let logRecord = await CallLog.updateLog(params)

            if (logRecord) {
                console.log('<---------logRecord--------->', logRecord);
                await User.updateCallMinutes(logRecord.caller_id, logRecord.duration)
                await User.UserCallStatus(logRecord.target_id, false)
            }

            await User.UserCallStatus(auth.id, false)
            // removing user from room
            users.delete(auth._id)
            await UserController.disconnetSocket(auth)
        });

        socket.on('_disconnecting', (params) => {
            console.log("_disconnecting params ===========>>>>>>>>>> ", params);
            console.log('disconnecting', socket.rooms); // Set { ... }
        });

    })
}
