"use strict";
//include chat model
const Model = require('../../models/ChatRoom');
const Controller = require('../controllers/Controller');

class RoomController extends Controller {

    constructor() {
        super();
    }

    async getRecord(params) {
        let chat = await Model.getData(params);
        return this.__sendResponse(params,"ChatRoom", chat, 200, "Room retrieved");
    }

    async getOneToOneRecord(params) {
        let chat = await Model.getOneToOneChat(params);
        return await this.__sendResponse(params,"ChatRoom", chat, 200, "One to one retrieved",1);
    }

    async getSingleRoom(params) {
        let chat = await Model.getData(params);
        return this.__sendResponse(params,"ChatRoom", chat, 200, "Room retrieved",1);
    }

    async getSingleRecordById(params) {

        let chat = await Model.getSingleRecord(params);
        if (typeof chat == "undefined") {
            chat = [];
        }
        return this.__sendResponse(params,"ChatRoom", chat, 200, "Get chat detail.");
    }


    async insertRecord(params) {

        let chat = await Model.Insert(params);
        if (typeof chat == "undefined") {
            chat = [];
        }
        return this.__sendResponse(params,"ChatRoom", chat, 200, "Message has saved.");
    }


    async createGroup(params) {
        let chat = await Model.groupCreate(params);
        if (typeof chat == "undefined") {
            chat = [];
        }
        return this.__sendResponse(params,"Group", chat, 200, "Message has saved.");
    }

    async getRecentGroup(params){

        let chat = await Model.getGroupChat(params);
        if (typeof chat == "undefined") {
            chat = [];
        }
        return this.__sendResponse(params,"Group", chat, 200, "Message has saved.",1);
    }
}

module.exports = RoomController
