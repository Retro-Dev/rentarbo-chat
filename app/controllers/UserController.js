"use strict";
//include chat model
const Model = require('../../models/User');
const ChatRoom = require('../../models/ChatRoom');
const Validator = require('validatorjs');
const Controller = require('../controllers/Controller');

class UserController extends Controller {

    constructor() {
        super();
    }

    async getRecord(params) {
        let users = await Model.getData(params);
        return this.__sendResponse(params,"", users, 200, "Login success",1);
    }

    async getSingleRecordById(params) {
        let users = await Model.getSingleRecord(params);
        return this.__sendResponse(params,"", users, 200, "Login success");
    }

    async insertRecord(params) {

        let rules = {
            username: 'required',
            email: 'required|email',
            password: 'required|min:6|confirmed'
        };
        let validator = new Validator(params, rules, []);

        function fails() {
            let record = [];
            let errors = validator.errors.all();
            for (var error in errors) {
                let jsonObj = {};
                jsonObj[error] = validator.errors.first(error);
                record.push(jsonObj)
            }

            return this.__sendResponse(params,"", record, 400, "Invalid data");
        }

        async function passes() {
            // Validation passed
            let user_id = await Model.Insert(params);
            let user = await Model.getSingleRecord({'user_id': user_id[0]});
            return this.__sendResponse(params,"", user, 200, "Signup successfully.");

        }

        validator.checkAsync(passes, fails)
    }

    async login(req, res) {
        let params = req.body;
        let user = await Model.loginUser(params);
        if (typeof user == "undefined") {
            let response = {data: [{"email": "invalid email or password"}]};
            return this.__sendResponse(params,"", response, 400,  "Invalid data");
        } else {

            return this.__sendResponse(params,"", user, 200, "Login success");
        }
    }

    async updateStatus(params) {
        let user = await Model.updateUserStatus(params);
        return await this.__sendResponse(params,"User",user,200, "User online now.");
    }


    async getRecentChat(user_data)
    {
        let rooms = await ChatRoom.getBothChat({user_id: user_data.user_id, search: user_data.search});
        var join_rooms = ["user_"+ user_data.user_id];
        if(rooms.length > 0){
            for (var room = 0; room < rooms.length; room++){
                join_rooms.push('room_' +  rooms[room].id)
            }
        }
        return await join_rooms;
    }
    
    async UserCallStatus(params,on_call_status)
    {
        let rooms = await Model.updateUserCallStatus(params,on_call_status);
        return await rooms;
    }
    async updateCallMinutes(params,on_call_status)
    {
        let rooms = await Model.callMinutes(params,on_call_status);
        return await rooms;
    }

}

module.exports = UserController;
