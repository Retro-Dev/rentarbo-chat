"use strict";
//include chat model
const Model = require('../../models/ChatMessage.js');
const Controller = require('../controllers/Controller');
const ChatRoom = require('../../models/ChatRoom');
const ChatRoomUser = require('../../models/ChatRoomUser');
const ChatMessageStatus = require('../../models/ChatMessageStatus');
//const ChatMessageDelete = require('../../models/ChatMessageDelete');

class ChatMessageController extends Controller {

    constructor() {
        super();
    }

    /**
     *
     * @param params
     * @returns {Promise<HttpResponse|{code: *, data: *, message: *}>}
     */
   async getRecord (params) {
       //console.log("ChatMessageController.getRecord",params)
        let message = await Model.getData(params);
        if (typeof message == "undefined"){
            message = [];
        }
        return this.__sendResponse(params,"ChatMessage",message,200,"Message retrieved",1);
    }

    /**
     *
     * @param params
     * @returns {Promise<HttpResponse|{code: *, data: *, message: *}>}
     */
    async getSingleRecordById (params) {
        let message = await Model.getSingleRecord(params);
        if (typeof message == "undefined"){
            message = [];
        }
        return this.__sendResponse(params,"",message,200,"Message Details.");
    }

    /**
     *
     * @param params
     * @returns {Promise<HttpResponse|{code: *, data: *, message: *}>}
     */
    async insertRecord (params) {
        if((typeof params.chat_room_id != "undefined") && params.chat_room_id < 1){
            let exists_room = await ChatRoom.checkOneToOneExistsOrNot(params);
            if(exists_room.length < 1){
                let room_detail = await ChatRoom.Insert(params)
                params.chat_room_id = room_detail;
            }else {
                params.chat_room_id = exists_room.id;
            }
        }
        let message = await Model.Insert(params);

        return this.__sendResponse(params, "ChatMessage",message,200,"Message has saved.");
    }


    async getAllParticipants(params){

        let participants = await ChatRoomUser.roomAllParticipants(params)
        let participant_id =  [];
        if(participants.length > 0){
            for (let i=0; i < participants.length; i++){
                participant_id.push("user_"+participants[i].id)
            }
        }

        return this.__sendResponse(params,"",participant_id,200,"Message has saved.");
    }


    async checkExistsRoom(params){

        let exists_room = await ChatRoom.checkOneToOneExistsOrNot(params);
        if(typeof exists_room.id != "undefined"  && exists_room.id > 0){
            params.chat_room_id = exists_room.id;
        }else {
            params.chat_room_id = 0;
        }
        return this.__sendResponse(params,"",params,200,"Message has saved.");
    }

    async deleteMessage(params){
        //console.log("paramsparamsparamsparams",params)
        let message = await Model.delete(params);
        return this.__sendResponse(params,"",message,200,"Message has deleted.");
    }


    async deleteRecentChat(params){
        let message = await ChatMessageStatus.deleteRecentChat(params);
        return this.__sendResponse(params,"",message,200,"Message has deleted.");
    }


    async readRecentChat(params){
        let message = await ChatRoomUser.readMessage(params);;
        return this.__sendResponse(params,"",message,200,"Message has deleted.");
    }
	
	async updateMessageCounter(params){
		let message = await Model.updateCounter(params);
	
		return this.__sendResponse(params,"",message,200,"Message has deleted.");
	}
}

module.exports = ChatMessageController;
