const UserShortInfoResourceClass = require('../resources/UserShortInfo');
const UserShortInfoResource = new UserShortInfoResourceClass;

class ChatMessage {

    constructor() {

    }

    async make(params,data) {
        var userData = [];
        let response = {};
        if(typeof data != "undefined"){
            if(typeof data.user_id != "undefined" && data.user_id > 0){
                userData = {
                    "id": data.user_id,
                    "name": data.name,
                    "image_url": data.image_url,
                    "online_status":data.online_status
                };
                userData = await UserShortInfoResource.make(params, userData);
            }

            response = {
                "id": data.id,
                "chat_room_id": data.chat_room_id,
                "message": data.message,
                "file_url": (data.file_url != null) ? __base_url + data.file_url : null,
                "file_data":data.file_data,
                "user_id": data.user_id,
                "user_data": userData,
                "target_id": params.target_id,
                "message_type": data.message_type,
                "is_anonymous": (typeof data.is_anonymous != "undefined" && data.is_anonymous > 0) ? data.is_anonymous : 0,
                "is_read": (typeof data.is_read != "undefined" && data.is_read > 0) ? data.is_read : 0,
                "created_at": data.created_at,
            }
        }

        return response;
    }

    async collection(params,data) {
        let response = [];
        if (data.length > 0) {
            var self = this;
            for (var i= 0; i < data.length; i++){
                var userData = [];
                if(typeof data[i].user_id != "undefined" && data[i].user_id > 0){
                    userData = {
                        "id": data[i].user_id,
                        "name": data[i].name,
                        "image_url": data[i].image_url,
                        "online_status":data[i].online_status
                    };
                    userData = await UserShortInfoResource.make(params, userData);
                }

                response.push({
                    "id": data[i].id,
                    "chat_room_id": data[i].chat_room_id,
                    "message": data[i].message,
                    "file_url": (data[i].file_url != null) ? __base_url + data[i].file_url : null,
                    "file_data":data[i].file_data,
                    "user_id": data[i].user_id,
                    "message_type": data[i].message_type,
                    "user_data": userData,
                    "target_id": params.target_id,
                    "is_anonymous": (typeof data[i].is_anonymous != "undefined" && data[i].is_anonymous > 0) ? data[i].is_anonymous : 0,
                    "is_read": (typeof data[i].is_read != "undefined" && data[i].is_read > 0) ? data[i].is_read : 0,
                    "created_at": data[i].created_at,
                });
            }
        }

        return await response;
    }
}

module.exports = ChatMessage
