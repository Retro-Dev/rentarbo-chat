"use strict";
const db = require('../config/knex.js')
const moment = require('moment');
const ChatRoomUser = require('../models/ChatRoomUser');
const User = require('../models/User');

class ChatMessageStatus {
    constructor(params) {
    }

    async getData(params) {
        let record = await db.select("*")
            .from("chat_message_status")
            .where("chat_message_status.chat_message_id", "=", params['chat_message_id'])


        return record;
    }

    async Insert(params = {}) {

        let members = await ChatRoomUser.getData(params);
        let message_receiver = [];

        for (var i = 0; i < members.length; i++) {
            if(params.user_id == members[i].user_id){
                message_receiver.push({
                    "user_id": members[i].user_id,
                    "chat_message_id": params.message_id,
                    "chat_room_id": params.chat_room_id,
                    "is_read": 1
                });
            }else {
                message_receiver.push({
                    "user_id": members[i].user_id,
                    "chat_message_id": params.message_id,
                    "chat_room_id": params.chat_room_id,
                    "is_read": 0
                });
            }
        }

        await db('chat_message_status').insert(message_receiver)

        return true;
    }


    async deleteRecentChat(params = {}){
        var record = ''
        if(typeof params.chat_room_id != "undefined" && params.chat_room_id > 0){
            await db("chat_room_users")
                .where("chat_room_users.chat_room_id", params.chat_room_id)
                .where("chat_room_users.user_id", params.user_id)
                .update({
                    "last_chat_message_id" :  0,
                    "last_message_timestamp" :  moment().format('YYYY-MM-DD HH:mm:ss'),
                    "unread_message_counts" : 0,
                })

            record = await db("chat_message_status")
                .where("chat_message_status.chat_room_id", params.chat_room_id)
                .where("chat_message_status.user_id", params.user_id)
                .update({
                    "deleted_at" :  moment().format('YYYY-MM-DD HH:mm:ss'),
                });
        }

        return record;
    }
}

module.exports = new ChatMessageStatus()
