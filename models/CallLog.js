'use strict'

const db = require('../config/knex.js')
const _ = require('lodash');
const moment = require('moment');
const CallLogUser = require('../models/CallLogUser');

class CallLog {
  /**
   * The table associated with the model.
   *
   * @var string
   */
  static get collection() {
    return "call_logs";
  }

  /**
   * The field name used to set the creation timestamp (return null to disable):
   */
  static get createdAtColumn() {
    return 'created_at';
  }

  /**
   * The field name used to set the creation timestamp (return null to disable):
   */
  static get updatedAtColumn() {
    return 'updated_at';
  }

  static softdelete() {
    return true;
  }

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  static getFields() {
    return ["channel_type", "channel_name", "slug", "created_at", "updated_at"];
  }

  /**
   * omit fields from database results
   */
  static get hidden() {
    return []
  }

  /**
   * mention column for select query
   */
  static showColumns() {
    return ["id", "channel_type", "channel_name", "slug", "created_at", "updated_at"];
  }

  /**
   * cache
   */
  static is_cache_record() {
    return false;
  }

  patient() {
    return this.belongsTo('../models/User', 'caller_id', 'id').select('name', 'image_url')
  }
  assistant() {
    return this.belongsTo('../models/User', 'target_id', 'id').select('name', 'image_url')
  }

  async createLog(params) {
    let data = {};
    data.channel_type = (typeof params.channel_type != "undefined") ? params.channel_type : "single";
    data.channel_name = (typeof params.channel_name != "undefined") ? params.channel_name : moment().unix("x");
    data.slug = moment().unix("x");
    let log = await db("call_logs").insert(data);
    console.log("log=================>>>>>>>>>", log);
    params.call_id = log;
    let logUser = await CallLogUser.createLogUser(params);
    return await db("call_logs").select("call_logs.*", "call_log_users.user_id", "call_log_users.reason", "call_log_users.start_call_time", "call_log_users.end_call_time", "call_log_users.duration", "call_log_users.user_uid", "call_log_users.call_type", "call_log_users.call_status", "call_log_users.user_status").where('call_logs.id', log).leftJoin("call_log_users", "call_log_users.call_id", "=", "call_logs.id").first()

  }

  async updateLog(params) {
    var data = {
      end_call_time: moment().format('YYYY-MM-DD HH:mm:ss'),
      duration: params.duration
    };

    let call_log = await db("call_log_users").where('call_id',).first();
    console.log(call_log);
    await db("call_log_users").where('call_id', call_log.id).update(data);

    return await db("call_logs").where('slug', params.slug).first()
  }

  static async generateSlug(slug) {
    let query = await this.where('slug', slug).count();
    return query == 0 || query == null ? slug : slug + query + rand(111, 999);
  }
}
module.exports = new CallLog()
