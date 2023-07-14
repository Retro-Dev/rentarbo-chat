"use strict";
const moment = require ( 'moment' );
const db = require ( '../config/knex.js' )

const ChatMessageStatus = require ( '../models/ChatMessageStatus' );
const ChatRoom = require ( '../models/ChatRoom' );
const ChatRoomUser = require ( '../models/ChatRoomUser' );

class ChatMessage
{
    async getData ( params ) {
        ChatRoomUser.readMessage ( params );
        let query = db.select ( "chat_messages.*" , "chat_message_status.is_read", 'u.name', 'u.image_url', 'u.online_status' )
                      .from ( "chat_messages" )
                      .leftJoin ( "chat_message_status" , "chat_message_status.chat_message_id" , "=" , "chat_messages.id" )
                      .leftJoin('users AS u','u.id','=','chat_messages.user_id')
                      .where ( "chat_message_status.user_id" , "=" , params.user_id )
                      .where ( "chat_messages.chat_room_id" , "=" , params.chat_room_id );

        if(typeof params.last_record_id != "undefined" && params.last_record_id != ''){
            query.where('chat_messages.id' ,"<", params.last_record_id);
        }

        let record = await query
            .limit (__paginition_limit)
            .whereNull ( "chat_messages.deleted_at" )
            .whereNull ( "chat_message_status.deleted_at" )
            .orderBy ( "chat_messages.created_at" , "desc" );

        return record;
    }

    async getSingleRecord ( params = {} ) {

        let query = db.select ( "chat_messages.*" , "chat_message_status.is_read", 'users.name', 'users.image_url', 'users.online_status' )
                      .from ( "chat_messages" )
                        .leftJoin("users", "users.id", "=", "chat_messages.user_id")
                      .leftJoin ( "chat_message_status" , "chat_message_status.chat_message_id" , "=" , "chat_messages.id" )
                      .where ( "chat_message_status.user_id" , "=" , params.user_id )
                      .where ( "chat_messages.id" , params.message_id );

        let result = await query.whereNull ( "chat_message_status.deleted_at" )
                                .first ();
        return result;
    }


    async Insert ( params = {} ) {
console.log("params",params);
        var anonymous = (typeof params.is_anonymous != "undefined" && params.is_anonymous > 0) ? 1 : 0;
        var time = moment().unix('x')
        var request = {
            user_id : params.user_id ,
            chat_room_id : params.chat_room_id ,
            message : ((typeof params.message_type != "undefined") && (params.message_type == "text")) ? params.message : "" ,
            is_anonymous : anonymous ,
            message_type : (typeof params.message_type != "undefined") ? params.message_type.toLowerCase() : "text" ,
            file_url : (typeof params.file_url != "undefined") ? params.file_url : null ,
            file_data : (typeof params.file_data != "undefined") ? params.file_data : null,
            created_at : moment().format ( 'YYYY-MM-DD HH:mm:ss' )
        };

        let message_id = await db ( 'chat_messages' ).insert ( request );

        params.message_id = message_id[0];
        params.show_all = true;

        await ChatMessageStatus.Insert ( params );
        //this.updateCounter(params);

        let result = await this.getSingleRecord ( params );

        return result;
    }


    async getUnReadMessageCount ( params ) {
        var unread_message_counts = await db ( "chat_messages" )
            .leftJoin ( "chat_message_status" , "chat_message_status.chat_message_id" , "=" , "chat_messages.id" )
            .where ( "chat_message_status.chat_room_id" , params.chat_room_id )
            .where ( "chat_message_status.user_id" , "=" , params.user_id )
            .where ( "chat_message_status.is_read" , 0 )
            .whereNull ( "chat_message_status.deleted_at" )
            .count ( "chat_messages.id AS unread_message_counts" );
        return unread_message_counts;
    }


    async lastMessage ( params ) {
        let query = db.select ( "chat_messages.*" , "chat_message_status.is_read" )
                      .from ( "chat_messages" )
                      .leftJoin ( "chat_message_status" , "chat_message_status.chat_message_id" , "=" , "chat_messages.id" )
                      .where ( "chat_messages.chat_room_id" , params.chat_room_id )
                      .where ( "chat_message_status.user_id" , "=" , params.user_id );

        let result = await query
            .whereNull ( "chat_message_status.deleted_at" )
            .orderBy ( "chat_messages.created_at" , "desc" )
            .first ();

        return result;
    }


    async delete ( params ) {
        let query = db ( "chat_message_status" )
            .where ( "user_id" , params.user_id )
            //.where("chat_room_id", params.chat_room_id)
            .where ( "chat_message_id" , params.message_id );

        await query.update ( {
                                 "deleted_at" : moment ().format ( 'YYYY-MM-DD HH:mm:ss' )
                             } );

        var unread_message = await this.getUnReadMessageCount ( params );
        var last_message = await this.lastMessage ( params );

        if ( typeof params.chat_room_id != "undefined" && params.chat_room_id > 0 ) {
            await db ( "chat_room_users" )
                .where ( "chat_room_id" , params.chat_room_id )
                .where ( "user_id" , params.user_id )
                .update ( {
                              "last_chat_message_id" : (
                                                           typeof last_message.id != "undefined"
                                                       ) ? last_message.id : 0 ,
                              "last_message_timestamp" : moment ().format ( 'YYYY-MM-DD HH:mm:ss' ) ,
                              "unread_message_counts" : unread_message[ 0 ].unread_message_counts
                          } );
        }

        return last_message;
    }


    async updateCounter ( params ) {
        var anonymous = (typeof params.is_anonymous != "undefined" && params.is_anonymous > 0) ? 1 : 0;

		await db ( "chat_room_users" )
            .where ( "chat_room_id" , params.chat_room_id )
            .where("user_id","<>",params.user_id)
            .increment ('unread_message_counts',1 );

		//await db.raw("UPDATE chat_room_users SET unread_message_counts = unread_message_counts + 1 WHERE chat_room_id = ?",[params.chat_room_id])

		await db ( "chat_room_users" )
            .where ( "chat_room_id" , params.chat_room_id )
            .update ({
					  "last_chat_message_id" : params.message_id ,
					  "last_message_timestamp" : moment ().format ( 'YYYY-MM-DD HH:mm:ss' ) ,
					  "is_anonymous" : anonymous
                     });

        return true;
    }
}

module.exports = new ChatMessage ()
