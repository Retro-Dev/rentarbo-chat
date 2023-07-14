const ChatMessageModel = require('../../models/ChatMessage');
const ChatRoomUserModel = require("../../models/ChatRoomUser");

const ChatMessageResourceClass = require("./ChatMessage");
const ChatMessageResource = new ChatMessageResourceClass;

const UserResourceClass = require("./UserShortInfo");
const UserResource = new UserResourceClass;
const regex = /([a-z]+\:\/+)([^\/\s]*)([a-z0-9\-@\^=%&;\/~\+]*)[\?]?([^ \#]*)#?([^ \#]*)/ig;

class Group {
    constructor() {
        this.ChatMessageModel = ChatMessageModel;
        this.ChatRoomUserModel = ChatRoomUserModel;
    }

    async make(params,data) {
        let lastMessageData = [];

        if(typeof data.last_chat_message_id != "undefined" && data.last_chat_message_id > 0){
            params.message_id = data.last_chat_message_id;
            lastMessageData = await ChatMessageResource.make(params, await this.ChatMessageModel.getSingleRecord(params));
        }

        var image = (regex.exec(data.image_url) != null) ? data.image_url : __base_url + data.image_url;

        let response = {
            "id": data.id,
            "identifier": data.identifier,
            "created_by": data.created_by,
            "title": data.title,
            "slug": data.slug,
            "image_url": ((data.image_url != null)) ? image : __base_url+'/images/user-placeholder.png',
            "description": data.description,
            "status": data.status,
            "type": data.type,
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
                if(typeof data[i].last_chat_message_id != "undefined" && data[i].last_chat_message_id > 0){
                    params.message_id = data[i].last_chat_message_id;
                    lastMessageData = await ChatMessageResource.make(params, await this.ChatMessageModel.getSingleRecord(params));
                }

                var image = (regex.exec(data[i].image_url) != null) ? data[i].image_url : __base_url + data[i].image_url;

                response.push({
                    "id": data[i].id,
                    "identifier": data[i].identifier,
                    "created_by": data[i].created_by,
                    "title": data[i].title,
                    "slug": data[i].slug,
                    "image_url": ((data[i].image_url != null)) ? image : __base_url+'/images/user-placeholder.png',
                    "description": data[i].description,
                    "status": data[i].status,
                    "type": data[i].type,
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

module.exports = Group
