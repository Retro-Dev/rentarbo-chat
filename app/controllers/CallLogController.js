"use strict";
//include chat model
const Model = require('../../models/CallLog.js');
const Controller = require('./Controller');

class CallLogController extends Controller {

    constructor() {
        super();
    }

    /**
     *
     * @param params
     * @returns {Promise<HttpResponse|{code: *, data: *, message: *}>}
     */
   async createLog (params) {
       console.log("CallLogController.createLog",params)
        let message = await Model.createLog(params);
        if (typeof message == "undefined"){
            message = [];
        }
        return this.__sendResponse(params,"CallLog",message,200,"Create Log.",1);
    }
   
    async updateLog (params,) {
       console.log("CallLogController.updateLog",params)
        let message = await Model.updateLog(params);
        if (typeof message == "undefined"){
            message = [];
        }
        return this.__sendResponse(params,"CallLog",message,200,"Create Log.",1);
    }

}

module.exports = CallLogController;
