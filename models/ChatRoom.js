"use strict";
const db = require('../config/knex.js')
const moment = require('moment');
const ChatRoomUser = require('./ChatRoomUser');
const ChatMessage = require('./ChatMessage');
const Helper = require('./../app/helpers/Helper');

class ChatRoom {
    async getData(params) {
        let record = '';
        let query = db.select("chat_rooms.*","chat_room_users.last_chat_message_id","chat_room_users.last_message_timestamp","chat_room_users.unread_message_counts")
            .from("chat_room_users")
            .innerJoin("chat_rooms", "chat_rooms.id", "=", "chat_room_users.chat_room_id")
            .where("chat_room_users.user_id", params.user_id);

        if (typeof params.search != "undefined" && params.search != "") {
            query.where("chat_rooms.title", 'LIKE', '%' + params.search + '%');
        }

        query.where("chat_rooms.type", "group")
            .unionAll(function () {
                this.select("users.name AS title", "users.id AS receiver_id", "users.online_status", "chat_rooms.id", "chat_rooms.identifier", "chat_rooms.created_by", "chat_rooms.image_url", "chat_rooms.slug", "chat_rooms.description", "chat_rooms.status", "chat_rooms.type", "chat_rooms.member_limit", "chat_rooms.last_chat_message_id", "chat_rooms.created_at")
                    .from("chat_room_users")
                    .innerJoin("users", "users.id", "=", "chat_room_users.user_id")
                    .innerJoin("chat_rooms", "chat_rooms.id", "=", "chat_room_users.chat_room_id")
                    .where("chat_room_users.user_id", "!=", params.user_id)
                    .whereIn("chat_room_users.chat_room_id", function () {
                        this.select("chat_room_id").from("chat_room_users").where("chat_room_users.user_id", params.user_id)
                    })
                    .where("chat_rooms.type", "=", 'single')
                    //.orderBy("chat_rooms.created_at","DESC")
                    .groupBy("chat_rooms.id")
                if (typeof params.search != "undefined" && params.search != "") {
                    this.where("users.name", 'LIKE', '%' + params.search + '%');
                }
            });

         if(typeof params.last_record_id != "undefined" && params.last_record_id != ''){
            query.where('chat_rooms.id' ,"<", params.last_record_id);
            }

        try {
            return await query.limit (__paginition_limit).orderBy("chat_room_users.last_message_timestamp", "DESC");
        } catch (e) {
            return "Query not execute ChatRoom getData."
        }
    }

    async getSingleRecord (params = {}) {
        let result = ''
        if (typeof params.chat_room_id != 'undefined' && typeof params.user_id != 'undefined') {
            try {
                result = await db.select("chat_rooms.*","chat_room_users.last_chat_message_id","chat_room_users.last_message_timestamp","chat_room_users.unread_message_counts")
                                 .from("chat_room_users")
                                 .innerJoin("chat_rooms", "chat_rooms.id", "=", "chat_room_users.chat_room_id")
                                 .where("chat_rooms.id", "=", params.chat_room_id)
                                 .whereNull("chat_rooms.deleted_at")
                                 .first();
            }
            catch (e) {
                return {
                    error: true,
                    code: 500,
                    message: 'Query not execute ChatRoom getSingleRecord.',
                    data: e.message
                }
            }
        }

        if (typeof result == 'undefined') {
            result = []
        }

        return result
    }

    async Insert(params = []) {

        let users = [];
        let user_id = '';
        let date = new Date();
        users.push(params.target_id)
        user_id = params.user_id;

        users.push(params.user_id);

        var time = moment().unix("x");

        if (typeof params.group_title == "undefined") {
            params.group_title = "single-" + time;
        }

        params.slug = await Helper.urlGenerate(params.group_title);

        var anonymous = (typeof params.is_anonymous != "undefined" && params.is_anonymous > 0) ? 1 : 0;
        let col = {
            identifier: params.slug + "-" + time,
            created_by: params.user_id,
            title: params.group_title,
            slug: params.slug,
            is_anonymous: anonymous,
            //last_message_timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            type: ((typeof params.group_type != "undefined") && params.group_type != "") ? params.group_type : "single",
            image_url: "https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg",
            description: ((typeof params.description != "undefined") && params.description != "") ? params.description : null
        };

        let room_id = await db('chat_rooms').insert(col);
        var member = [];
        if (users.length > 0) {
            users.forEach((value, index) => {
                if (value == params.user_id) {
                    member.push({
                        "chat_room_id": room_id[0],
                        "user_id": value,
                        "is_anonymous": anonymous,
                        "is_owner": 1
                    })
                } else {
                    member.push({
                        "chat_room_id": room_id[0],
                        "user_id": value,
                        "is_owner": 0
                    })
                }
            });

            params.chat_room_id = room_id[0];
            await ChatRoomUser.Insert(member);
        }

        return await room_id[0];
    }

    async getOneToOneChat(params) {
        let query =  db.select("cr.*",
                                "cru.last_chat_message_id",
                                "cru.last_message_timestamp",
                                "cru.unread_message_counts",
                                "u.id AS target_user_id",
                                "u.name AS target_user_name",
                                "u.image_url AS target_user_image_url",
                                "u.online_status AS target_user_online_status",
                                "cm.created_at AS message_created_at",
                                "cm.file_data",
                                "cm.file_url",
                                "cm.is_anonymous",
                                "cm.message",
                                "cm.message_type",
                                "cm.user_id AS message_created_by")
            .from("chat_rooms AS cr")
            .innerJoin("chat_room_users AS cru", "cru.chat_room_id", "=", "cr.id")
            .innerJoin("chat_room_users AS cru2", function(){
                this.on("cru.chat_room_id", "=", "cru2.chat_room_id");
                this.on("cru2.user_id", "!=", params.user_id);
            })
            .innerJoin('users AS u','u.id','=','cru2.user_id')
            .leftJoin('chat_messages AS cm','cm.id','=','cru.last_chat_message_id')
            .leftJoin('chat_message_status AS cms','cms.chat_room_id','=','cru.chat_room_id')
            .where("cru.user_id", "=", params.user_id)
            .where("cr.type", "=", 'single')
            .whereNull("cms.deleted_at")
            // .where("cms.user_id",params.user_id)
            .whereNull("cru.deleted_at");

        if(typeof params.last_record_id != "undefined" && params.last_record_id != ''){
            query.where('cr.id' ,"<", params.last_record_id);
        }

        let result = await query.orderBy("cru.last_message_timestamp", "DESC")
                            .groupBy("cr.id").limit (__paginition_limit);

        if (typeof result == "undefined") {
            result = [];
        }
        return result;
    }

    async getGroupChat (params) {
        let query =  db.select('chat_rooms.*', 'chat_room_users.last_chat_message_id', 'chat_room_users.last_message_timestamp', 'chat_room_users.unread_message_counts')
                         .from('chat_room_users')
                         .innerJoin('users', 'users.id', '=', 'chat_room_users.user_id')
                         .innerJoin('chat_rooms', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
                         .where('chat_room_users.user_id', '=', params.user_id)
                         .where('chat_rooms.type', '=', 'group')
                         .whereNull('chat_room_users.deleted_at');

        if(typeof params.last_record_id != "undefined" && params.last_record_id != ''){
            query.where('chat_rooms.id' ,"<", params.last_record_id);
        }

        let result = await query.orderBy('chat_room_users.last_message_timestamp', 'DESC').groupBy('chat_rooms.id').limit (__paginition_limit);

        if (typeof result == 'undefined') {
            result = []
        }

        return result
    }

    async checkOneToOneExistsOrNot(params = {}) {

        if( params.is_anonymous != 'undefined' ){
          params.is_anonymous = 0
        }

        let result = '';
        let query = db.select( "users.name AS title", "users.id AS receiver_id", "users.online_status", "chat_rooms.id", "chat_rooms.identifier", "chat_rooms.created_by", "chat_rooms.image_url", "chat_rooms.slug", "chat_rooms.description", "chat_rooms.status", "chat_rooms.type", "chat_rooms.member_limit", "chat_room_users.last_chat_message_id", "chat_rooms.created_at")
            .from("chat_rooms")
            .innerJoin("chat_room_users", "chat_rooms.id", "=", "chat_room_users.chat_room_id")
            .innerJoin("users", "users.id", "=", "chat_room_users.user_id");

        if (typeof params.chat_room_id != "undefined" && params.chat_room_id > 0) {
            query.where("chat_room_users.chat_room_id", params.chat_room_id)
        }

        if (typeof params.is_anonymous != "undefined" && params.is_anonymous > 0) {
            query.where("chat_rooms.created_by", params.created_by)
        }

        result = await query.where("chat_rooms.is_anonymous", params.is_anonymous)
            .whereIn("chat_room_users.user_id", [params.user_id, params.target_id])
            .where("chat_rooms.type", "=", "single")
            //.orderBy("chat_rooms.created_at","DESC")
            .groupBy("chat_rooms.id").havingRaw("COUNT(chat_room_users.user_id) > 1").first();

        if (typeof result == "undefined") {
            result = [];
        }

        return result;
    }

    async groupCreate (params = {}) {

        let users = params.group_users
        users.push(params.user_id)
        var time = moment().unix('x')

        params.slug = await Helper.urlGenerate(params.group_title)
        var anonymous = (typeof params.is_anonymous != 'undefined' && params.is_anonymous > 0) ? 1 : 0
        let col = {
            identifier: params.slug + '-' + time,
            created_by: params.user_id,
            title: params.group_title,
            slug: params.slug,
            is_anonymous: anonymous,
            type: ((typeof params.group_type != 'undefined') && params.group_type != '') ? params.group_type : 'single',
            image_url: ((typeof params.group_image != 'undefined') && params.image_url != '') ? params.group_image : 'https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg',
            description: ((typeof params.description != 'undefined') && params.description != '') ? params.description : null
        }


        let room_id = await db('chat_rooms').insert(col)
        var member = []
        if (users.length > 0) {
            for(let u=0; u < users.length; u ++) {
                if (users[u] == params.user_id) {
                    member.push({
                            'chat_room_id': room_id[0],
                            'user_id': users[u],
                            'is_anonymous': anonymous,
                            'is_owner': 1,
                            'last_message_timestamp': moment().format('YYYY-MM-DD HH:mm:ss')
                        });
                }
                else {
                    member.push({
                        'chat_room_id': room_id[0],
                        'user_id': users[u],
                        'is_anonymous': anonymous,
                        'is_owner': 0,
                        'last_message_timestamp': moment().format('YYYY-MM-DD HH:mm:ss')
                                });
                }
            }

            params.chat_room_id = room_id[0];
            await ChatRoomUser.Insert(member);
        }

        return await this.getSingleRecord(params);
    }

    async getBothChat (params) {
        let result = ''
        result = await db.select('chat_rooms.*', 'chat_room_users.last_chat_message_id', 'chat_room_users.last_message_timestamp', 'chat_room_users.unread_message_counts')
                         .from('chat_room_users')
                         .innerJoin('users', 'users.id', '=', 'chat_room_users.user_id')
                         .innerJoin('chat_rooms', 'chat_rooms.id', '=', 'chat_room_users.chat_room_id')
                         .where('chat_room_users.user_id', '=', params.user_id)
                         .whereIn('chat_room_users.chat_room_id', function () {
                             this.select('chat_room_users.chat_room_id')
                                 .from('chat_room_users')
                                 .where('chat_room_users.user_id', params.user_id)
                                 .whereNull('chat_room_users.deleted_at')
                                 .groupBy('chat_room_users.chat_room_id')
                         })
            // .where('chat_rooms.type', '=', 'single')
                         .whereNull('chat_room_users.deleted_at')
                         .orderBy('chat_room_users.last_message_timestamp', 'DESC')
                         .groupBy('chat_rooms.id')

        if (typeof result == 'undefined') {
            result = []
        }

        return result
    }
}

module.exports = new ChatRoom();
