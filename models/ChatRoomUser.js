"use strict";
const db = require('../config/knex.js')

class ChatRoomUser {
    constructor(params){
    }

    async getData(params) {
        let query = db.select("chat_room_users.*")
            .from("chat_room_users")
            //.leftJoin("users","users.id","=","chat_room_users.user_id")

        if(typeof params.show_all == "undefined"){
            query = query.where("chat_room_users.user_id", "!=", params['user_id']);
        }

        let record = await query.where("chat_room_users.chat_room_id", "=", params['chat_room_id']);

        return record;
    }

    async Insert(params = []) {
        return await db('chat_room_users').insert(params);
    }

    async myRooms(params= {}){
        let  result = await db.select("chat_room_users.*")
            .from("chat_room_users")
            .where("chat_room_users.user_id","=",params.user_id);

        return result;
    }

    async roomAllParticipants(params= {}){
        let  query = db.select("users.*","chat_room_users.is_anonymous")
            .from("chat_room_users")
            .leftJoin("users","users.id","=","chat_room_users.user_id");

        if(typeof params.user_id != "undefined" && params.user_id > 0){
            query.where("chat_room_users.user_id","!=",params.user_id);
        }

        let result = await query.where("chat_room_users.chat_room_id","=",params.chat_room_id).first();

        return result;
    }

    async readMessage(params = {}){

        await db("chat_message_status")
            .where("chat_room_id","=",params.chat_room_id)
            .where("user_id","=",params.user_id)
            .update({
                        "is_read" : 1
                    })

        return await db("chat_room_users")
            .where("chat_room_id","=",params.chat_room_id)
            .where("user_id","=",params.user_id)
            .update({
            "unread_message_counts" : 0
        })
    }
}

module.exports = new ChatRoomUser()
