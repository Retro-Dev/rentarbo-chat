const UserResourceClass = require("./UserShortInfo");
const UserResource = new UserResourceClass;

class ChatRoom {
    constructor() {

    }

    async make(params,data) {
        let lastMessageData = [];
        let targetUserData = [];
        if(typeof data.last_chat_message_id != "undefined" && data.last_chat_message_id > 0){
            lastMessageData = {
                "id": data.last_chat_message_id,"chat_room_id": data.chat_room_id,
                "message": data.message,
                "file_url": (data.file_url != null) ? __base_url + data.file_url : null,
                "file_data":data.file_data,
                "user_id": data.message_created_by,
                "message_type": data.message_type,
                "is_anonymous": (typeof data.is_anonymous != "undefined" && data.is_anonymous > 0) ? data.is_anonymous : 0,
                "created_at": data.message_created_at
            }
        }
        if(typeof data.created_by != "undefined" && data.created_by > 0){
            targetUserData = {
                "id": data.target_user_id,
                "name": data.target_user_name,
                "image_url": data.target_user_image_url,
                "online_status":data.target_user_online_status
            }
            targetUserData = await UserResource.make(params,targetUserData);
        }

        let response = {
            "id": data.id,
            "identifier": data.identifier,
            "created_by": data.created_by,
            "title": data.title,
            "slug": data.slug,
            "image_url": data.image_url,
            "description": data.description,
            "status": data.status,
            "type": data.type,
            "target_user_data": targetUserData,
            "member_limit": data.member_limit,
            "last_message_timestamp": data.last_message_timestamp,
            "last_chat_message": lastMessageData,
            "unread_message_counts": data.unread_message_counts,
            "is_anonymous": (typeof data.is_anonymous != "undefined" && data.is_anonymous > 0) ? data.is_anonymous : 0,
            "created_at": data.created_at
        }

        return response;
    }

    async collection(params,data) {
        let response = [];
        if (data.length > 0) {
            var self = this;
            for (var i= 0; i < data.length; i++){
                let lastMessageData = [];
                let targetUserData = [];
                if(typeof data[i].last_chat_message_id != "undefined" && data[i].last_chat_message_id > 0){
                    lastMessageData = {
                        "id": data[i].last_chat_message_id,"chat_room_id": data.chat_room_id,
                        "message": data[i].message,
                        "file_url": (data[i].file_url != null) ? __base_url + data.file_url : null,
                        "file_data":data[i].file_data,
                        "user_id": data[i].message_created_by,
                        "message_type": data[i].message_type,
                        "is_anonymous": (typeof data[i].is_anonymous != "undefined" && data.is_anonymous > 0) ? data.is_anonymous : 0,
                        "created_at": data[i].message_created_at
                    }
                }
                if(typeof data[i].created_by != "undefined" && data[i].created_by > 0){
                    targetUserData = {
                        "id": data[i].target_user_id,
                        "name": data[i].target_user_name,
                        "image_url": data[i].target_user_image_url,
                        "online_status":data[i].target_user_online_status
                    }
                    targetUserData = await UserResource.make(params,targetUserData);
                }
                response.push({
                    "id": data[i].id,
                    "identifier": data[i].identifier,
                    "created_by": data[i].created_by,
                    "title": data[i].title,
                    "slug": data[i].slug,
                    "image_url": data[i].image_url,
                    "description": data[i].description,
                    "status": data[i].status,
                    "type": data[i].type,
                    "target_user_data": targetUserData,
                    "member_limit": data[i].member_limit,
                    "last_message_timestamp": data[i].last_message_timestamp,
                    "last_chat_message": lastMessageData,
                    "unread_message_counts": data[i].unread_message_counts,
                    "is_anonymous": (typeof data[i].is_anonymous != "undefined" && data[i].is_anonymous > 0) ? data[i].is_anonymous : 0,
                    "created_at": data[i].created_at
                });
            }
        }

        return await response;
    }
}

module.exports = ChatRoom
