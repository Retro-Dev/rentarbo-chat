'use strict'

const db = require('../config/knex.js')
const _ = require('lodash');
const moment = require('moment');

class CallLogUser {
  /**
   * The table associated with the model.
   *
   * @var string
   */
  static get collection() {
    return "call_log_users";
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
    return ["user_id", "reason", "start_call_time", "end_call_time", "duration", "user_uid", "call_type", "call_status", "user_status", "created_at", "updated_at"];
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
    return ["id", "user_id", "call_id", "reason", "start_call_time", "end_call_time", "duration", "user_uid", "call_type", "call_status", "user_status", "created_at", "updated_at"];
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

  async createLogUser(params) {

    let $getFields = ["user_id", "reason", "start_call_time", "end_call_time", "duration", "user_uid", "call_type", "call_status", "user_status", "created_at", "updated_at"];
    var data = {};

    if (typeof params.call_status != "undefined" && params.call_status == "call_start") {
      params.start_call_time = moment().format('YYYY-MM-DD HH:mm:ss')
      params.user_status = "Busy"
    }

    for (const [key, value] of Object.entries($getFields)) {
      if (typeof params[value] != "undefined") {
        data[value] = params[value];
      }
    }

    let log = await db("call_log_users").insert(data);
    return log

  }
}
module.exports = new CallLogUser()
