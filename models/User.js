"use strict";
const db = require('../config/knex.js');
var passwordHash = require('password-hash');
const { token } = require('morgan');

class User {

    async getData(params = {}) {
        let record = await db.select("*")
            .from('users')
            .where("users.id", "<>", params.user_id)
            .orderBy("users.created_at", "DESC");

        return record;
    }

    async getSingleRecord(params = {}) {
        let record = await db.select("*")
            .from('users')
            .where("users.id", params.user_id)
            .whereNull("users.deleted_at")
            .first();

        return record;
    }

    async Insert(params = []) {
        let record = await db('users').insert({
            username: params.username,
            email: params.email,
            image_url: "https://static.turbosquid.com/Preview/001292/481/WV/_D.jpg",
            password: passwordHash.generate(params.password),
            token: passwordHash.generate("token-" + params.email)
        });

        return record;
    }

    async loginUser(params = {}) {
        let record = await db.select("*")
            .from('users')
            .where("users.email", params['email'])
            .where("users.password", passwordHash.generate(params['password']))
            .first();

        return record;
    }

    async updateUserStatus(params = {}) {
        console.log("USERUPDATE",params.user_id);
        let record = await db("users")
            .where("id", params.user_id)
            .update({"online_status": params.online_status});

        return await this.getSingleRecord({"user_id": params.user_id});
    }

    async getUserByApiToken(api_token) {
        console.log("TOken"+api_token)
        let record = await db.select()
            .from('users AS u')
            .select('u.*','upt.api_token')
            .innerJoin('user_api_token AS upt', 'upt.user_id', '=', 'u.id')
            .where('upt.api_token', api_token)
            .first();
        return record;
    }

    async updateUserCallStatus(assistant_id, on_call_status) {
    
        console.log('user status false----------->>>',assistant_id)
        await db("users")
            .where("id", assistant_id)
            .update({on_call:on_call_status})
    }

    async callMinutes(caller_id, duration) {
        console.log('callMinutes ----------->>>',assistant_id)
        duration = parseInt(duration)

        let query = await db("users").where("id",caller_id).update({ $inc: { total_minutes: - duration, usage_minutes: - duration, remaining_minutes: -duration } })
    }
}

module.exports = new User();
